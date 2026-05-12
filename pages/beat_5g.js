// --- [1] 設定・定数（ファイルの一番上にまとめる） ---
const MAX_GROUPS = 5;
// 数字(0, 1, 2...)をアルファベット(A, B, C...)に変換して配列を作る
// String.fromCharCode(65) が "A" なのを利用するっす
const GROUP_IDS = Array.from({ length: MAX_GROUPS }, (_, i) => String.fromCharCode(65 + i));
const PERCENTAGE_FACTOR = 100;
const DEFAULT_HDI = 0.94;
const DEFAULT_HDI_50 = 0.5;

/**
 * データの取得と整形
 */
function getInputData() {
  // 補助関数：全角数字を半角に変換
  const toHalfWidth = (str) => {
    return str
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      .replace(/　/g, " "); // 全角スペースを半角に
  }

  const parseInput = (id) => {
    let raw = document.getElementById(id).value;
    raw = toHalfWidth(raw);

    // カンマ区切りなどの数値を処理
    // 「数字,数字」となっている箇所のカンマだけを、先に空文字に置換して消去する
    // これで Excelの 1,000 は 1000 になる。
    // ※ 1,000 2,000 の間の「, 」（カンマ+スペース）は、後ろのスペースが残る。
    const cleaned = raw.replace(/(\d),(?=\d)/g, '$1');

    return cleaned
      .replace(/,/g, " ")       // 残ったカンマ（区切り用）をスペースに
      .split(/\s+/)             // 改行・タブ・スペースで分割
      .filter(v => v !== "")    // 空っぽを除外
      .map(Number)              // 数値に変換
      .filter(v => !isNaN(v))   // 数字じゃない（NaN）ものを念のため弾く
      .slice(0, MAX_GROUPS);             // 最初のMAX_GROUPSだけ取る
  };

  const denoms = parseInput('denoms');
  const numers = parseInput('numers');

  const groupCount = Math.min(denoms.length, numers.length);
  return { denoms, numers, groupCount };
}

/**
 * 入力値のリアルタイムチェック（テーブルを動的に生成）
 */
function updateConfirmationTable() {
  const { denoms, numers, groupCount } = getInputData();
  const table = document.getElementById('confirmation-table');
  const runButton = document.getElementById('run-button');
  const groupIds = ['A', 'B', 'C', 'D', 'E'];


  if (!table) return;

  // テーブルの枠組みを作成
  let html = `<table class="confirmation-table">
                <thead>
                    <tr>
                        <th>Group</th>
                        <th>分母</th>
                        <th>分子</th>
                        <th>比率 (%)</th>
                    </tr>
                </thead>
                <tbody>`;

  // エラーがあるかどうかを記録するフラグ
  let hasError = false;

  for (let i = 0; i < groupCount; i++) {
    const d = denoms[i];
    const n = numers[i];

    // 異常値の判定（数字じゃない、分子>分母、マイナス、分母0）
    const isInvalid = isNaN(n) || isNaN(d) || (n > d) || (n < 0) || (d <= 0);

    // 一つでも異常があればエラーフラグを立てる
    if (isInvalid) {
      hasError = true;
    }

    const rateRaw = (d > 0) ? (PERCENTAGE_FACTOR * n / d) : 0;
    const rateDisplay = rateRaw.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // 異常ならCSSクラスを付与
    const rowStyle = isInvalid ? 'class="invalid-cell"' : '';
    const textStyle = isInvalid ? 'class="invalid-value"' : '';

    html += `<tr ${rowStyle}>
                    <th style="text-align: center;">Group ${groupIds[i]}</th>
                    <td align="right">${Math.round(d).toLocaleString()}</td>
                    <td align="right">${Math.round(n).toLocaleString()}</td>
                    <td align="right" ${textStyle}>${rateDisplay}%</td>
                 </tr>`;
  }

  html += `</tbody></table>`;
  table.innerHTML = html;

  // ★バリデーション結果をボタンに反映
  if (runButton) {
    // エラーがある、またはデータが1件もない場合はボタンを押せなくする
    runButton.disabled = hasError || groupCount === 0;

    // 見た目も変える
    if (runButton.disabled) {
      runButton.style.opacity = "0.5";
      runButton.style.cursor = "not-allowed";
    } else {
      runButton.style.opacity = "1.0";
      runButton.style.cursor = "pointer";
    }
  }

}

/**
 * タブを切り替える関数
 */
function switchTab(tabName) {
  // 1. 全てのパネルから active クラスを外す
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });

  // 2. 選択されたパネルだけに active クラスをつける（CSSの.active { display: block; } が効く）
  const targetPanel = document.getElementById(`${tabName}-content`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }

  // 3. ボタンの active クラス付け替え
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.classList.remove('active');
  });

  // クリックされたボタンを特定して active にする
  const clickedButton = document.querySelector(`.tab-btn[onclick*="${tabName}"]`);
  if (clickedButton) {
    clickedButton.classList.add('active');
  }
}

/**
 * メイン実行関数：ベイズ推定の計算と描画
 */
function runBayesianEstimation() {
  // --- 準備・バリデーション ---
  const { denoms, numers, groupCount } = getInputData();
  if (groupCount < 2) {
    return alert("推定には少なくとも2群のデータが必要にゃん。手元にデータがなければresetボタン押してサンプルデータで試してにゃん");
  }

  // 共通ヘルパー：HDI（最高密度区間）を計算する
  const calcHDI = (samples, level = DEFAULT_HDI) => {
    const sorted = [...samples].sort((a, b) => a - b);
    const lowIdx = Math.floor(samples.length * (1 - level) / 2);
    const highIdx = Math.floor(samples.length * (1 - (1 - level) / 2));
    return {
      mean: jStat.mean(samples),
      lower: sorted[lowIdx],
      upper: sorted[highIdx]
    };
  };

  const numSamples = parseInt(document.getElementById('sample-count').value);
  const groupIds = GROUP_IDS;
  // const colors = ['tab:blue', 'tab:orange', 'tab:cyan', 'gray', 'tab:pink'];
  // const colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#7f7f7f', '#9467bd'];
  const colors = [
    'rgba(31, 119, 180, 1)', 'rgba(255, 127, 14, 1)', 'rgba(44, 160, 44, 1)',
    'rgba(127, 127, 127, 1)', 'rgba(148, 103, 189, 1)'
  ];

  // --- 0. 計算フェーズ（全群のサンプリング。ベータ分布） ---
  const bayesianResults = Array.from({ length: groupCount }, (_, i) => {
    const alpha = 1 + numers[i];
    const beta = 1 + denoms[i] - numers[i];
    const samples = Array.from({ length: numSamples }, () => PERCENTAGE_FACTOR * jStat.beta.sample(alpha, beta));

    return {
      id: groupIds[i],
      samples: samples,
      // 色を決める際に i % colors(上で5色指定) するとiが5になっても 5÷5=余り0
      // なので配列の最初に戻ってまた1色目（インデックス0）からループで色を使う仕組み
      color: colors[i % colors.length],
      ...calcHDI(samples) // mean, lower, upper を展開して格納
    };
  });

  // --- 描画関数の定義 ---

  // 1. 全群の事後分布グラフ
  const plotPosteriorDistributions = (groupStats) => {
    const data = groupStats.map(group => ({
      x: group.samples,
      name: `Group ${group.id}`,
      type: "histogram",
      // percentageにする。sampling回数を変えても合計1（100%）にしたいため
      histnorm: 'probability density',
      opacity: 0.7,
      marker: { color: group.color },
      hovertemplate: `<b>Group ${group.id}</b><br>Mean: ${group.mean.toFixed(2)}%<br>94% HDI: [${group.lower.toFixed(2)} , ${group.upper.toFixed(2)}]<br><extra></extra>`,
      hoverlabel: { bgcolor: group.color.replace('1)', '0.7)'), font: { color: "#ffffff" }, bordercolor: group.color }
    }));
    const layout = {
      barmode: "overlay", title: "Posterior Distributions of Rate",
      xaxis: { title: "Rate (%)", fixedrange: true },
      yaxis: { title: "Density", showgrid: false, fixedrange: true },
      margin: { t: 30, b: 40 }
    };
    Plotly.newPlot('summary-chart', data, layout, { displayModeBar: false });
  };

  // 2. 全群のHDI比較グラフ（フォレストプロット風。グラフは1群ごとにプロット）
  const plotIndividualHDIs = (groupStats) => {
    const container = document.getElementById('all-groups-hdi-container');
    container.innerHTML = "";
    const allVals = groupStats.flatMap(s => s.samples);
    // 全群の中での最小値と最大値を求めてxlimを固定しつつ、少し余裕を持たせる
    const xRange = [Math.min(...allVals) * 0.8, Math.max(...allVals) * 1.1];

    groupStats.forEach(s => {
      const divId = `hdi-single-${s.id}`;
      const div = document.createElement('div');
      div.id = divId;
      div.className = 'hdi-individual-plot';
      container.appendChild(div);

      const data = [{
        x: [s.mean], y: [0], type: 'scatter', mode: 'markers',
        marker: { color: 'white', size: 6, line: { color: s.color.replace('1)', '0.7)'), width: 1 } }, // 白抜きの点にする
        error_x: { type: 'data', symmetric: false, array: [s.upper - s.mean], arrayminus: [s.mean - s.lower], thickness: 3, color: s.color.replace('1)', '0.7)'), width: 0 }
        // widthを0にすると端の縦線（キャップ）が消える
      }];
      const layout = {
        xaxis: { range: xRange, showgrid: false, showticklabels: false, zeroline: false, fixedrange: true },
        yaxis: { showticklabels: false, range: [-0.2, 1], showgrid: false, zeroline: false, fixedrange: true },
        margin: { t: 5, b: 10, l: 50, r: 50 },
        annotations: [
          { text: `Group ${s.id}`, xref: 'paper', x: -0.05, y: 0.4, showarrow: false },
          { x: s.mean, y: 0.6, text: s.mean.toFixed(2), showarrow: false, font: { color: s.color.replace('1)', '0.7)') } },
          { x: s.lower, y: 0.6, text: `<b>${s.lower.toFixed(2)}</b>`, showarrow: false, xshift: -8, font: { color: s.color.replace('1)', '0.7)') } },
          { x: s.upper, y: 0.6, text: `<b>${s.upper.toFixed(2)}</b>`, showarrow: false, xshift: 8, font: { color: s.color.replace('1)', '0.7)') } }
          // xshiftで表示位置を8pxずらす
        ]
      };
      Plotly.newPlot(divId, data, layout, { staticPlot: true });
    });
  };

  // 3. 推定結果（Mean, HDI）のテーブル表示
  const updateSummaryTable = (groupStats) => {
    const container = document.getElementById('summary-table-container');
    if (!container) return;
    let rows = groupStats.map(s => `
            <tr>
                <td style="text-align: center;">Group ${s.id}</td>
                <td align="right">${s.mean.toFixed(2)}%</td>
                <td align="right">${s.lower.toFixed(2)}%</td>
                <td align="right">${s.upper.toFixed(2)}%</td>
            </tr>`).join('');
    container.innerHTML = `<table class="summary-table"><thead><tr><th>Group</th><th>Mean</th><th>HDI Lower</th><th>HDI Upper</th></tr></thead><tbody>${rows}</tbody></table>`;
  };

  // 4. 2群間のHDI比較（フォレストプロット風。グラフは全群まとめてプロット）
  const plotSummaryForest = (diffStats) => {
    const container = document.getElementById('all-diffs-summary-container');
    if (!container) return;
    container.innerHTML = "";

    const chartDiv = document.createElement('div');
    const pairCount = (diffStats.length * (diffStats.length - 1)) / 2;
    chartDiv.style.height = `${pairCount * 30 + 100}px`;
    chartDiv.style.width = "100%";
    container.appendChild(chartDiv);

    // x軸の範囲(xlim)を算出
    let allDiffValues = [];
    for (let i = 0; i < diffStats.length; i++) {
      for (let j = i + 1; j < diffStats.length; j++) {
        const pairDiffs = diffStats[i].samples.map((val, idx) => val - diffStats[j].samples[idx]);
        allDiffValues.push(...pairDiffs);
      }
    }
    const xMin = Math.min(...allDiffValues) * 1.1;
    const xMax = Math.max(...allDiffValues) * 1.1;

    const data = [];
    const yLabels = [];
    let yPos = 0;

    for (let i = 0; i < diffStats.length; i++) {
      for (let j = i + 1; j < diffStats.length; j++) {
        const diffs = diffStats[i].samples.map((val, idx) => val - diffStats[j].samples[idx]);

        // 94% HDI と 50% HDI をそれぞれ計算
        const hdi = {
          outer: calcHDI(diffs, DEFAULT_HDI),
          inner: calcHDI(diffs, DEFAULT_HDI_50)
        };
        const name = `diff ${diffStats[i].id} - ${diffStats[j].id}`;
        yLabels.push(name);

        // --- 1. 外側の細い線 (94% HDI) ---
        data.push({
          x: [hdi.outer.mean], y: [yPos], name: name, type: 'scatter', mode: 'markers',
          marker: { color: '#729fcf', size: 6 }, // 点は小さめに
          error_x: {
            type: 'data', symmetric: false,
            array: [hdi.outer.upper - hdi.outer.mean],
            arrayminus: [hdi.outer.mean - hdi.outer.lower],
            thickness: 2, // ★ 細い線
            color: '#729fcf', width: 0
          },
          hoverinfo: 'none'
        });

        // --- 2. 内側の太い線 (50% HDI) ---
        data.push({
          x: [hdi.inner.mean], y: [yPos], type: 'scatter', mode: 'markers',
          marker: { color: '#729fcf', size: 0 }, // 点は描画しない
          error_x: {
            type: 'data', symmetric: false,
            array: [hdi.inner.upper - hdi.inner.mean],
            arrayminus: [hdi.inner.mean - hdi.inner.lower],
            thickness: 4, // ★ 太い線
            color: '#729fcf', width: 0
          },
          hoverinfo: 'none'
        });

        // --- 3. 中心点 (Mean) ---
        data.push({
          x: [hdi.outer.mean], y: [yPos], type: 'scatter', mode: 'markers',
          marker: { color: 'white', size: 4, line: { color: '#729fcf', width: 1 } }, // 白抜きの点にする
          hoverinfo: 'none'
        });

        yPos++;
      }
    }

    const layout = {
      title: "Summary of Group Difference (94% HDI)",
      xaxis: { range: [xMin, xMax], zeroline: true, zerolinecolor: 'orange', zerolinewidth: 2, fixedrange: true },
      yaxis: { tickvals: Array.from({ length: pairCount }, (_, k) => k), ticktext: yLabels, autorange: "reversed", zeroline: false, showgrid: false, fixedrange: true },
      margin: { t: 60, b: 60, l: 100, r: 50 },
      showlegend: false
    };

    Plotly.newPlot(chartDiv, data, layout, { staticPlot: true, responsive: true });
  };

  // 5. 2群間の差の分布（ヒストグラム群）
  const plotDifferenceDistributions = (diffStats) => {
    const container = document.getElementById('diff-charts-container');
    container.innerHTML = "";
    for (let i = 0; i < diffStats.length; i++) {
      for (let j = i + 1; j < diffStats.length; j++) {
        const diffs = diffStats[i].samples.map((val, idx) => val - diffStats[j].samples[idx]);
        const dStats = calcHDI(diffs);
        const prob = (diffs.filter(d => d > 0).length / numSamples) * PERCENTAGE_FACTOR;

        const div = document.createElement('div');
        div.className = 'diff-plot';
        container.appendChild(div);

        const plotData = [{ x: diffs, type: 'histogram', histnorm: 'probability density', marker: { color: 'skyblue' }, opacity: 0.7 }];
        const layout = {
          title: `diff ${diffStats[i].id} - ${diffStats[j].id}`,
          yaxis: { showgrid: false, showticklabels: false },
          shapes: [
            { type: 'line', xref: 'x', x0: dStats.lower, x1: dStats.upper, yref: 'paper', y0: 0.05, y1: 0.05, line: { color: 'black', width: 4 } },
            { type: 'line', xref: 'x', x0: 0, x1: 0, yref: 'paper', y0: 0, y1: 0.6, line: { color: 'orange', width: 1.5 } }
          ],
          // 余白の設定（t:上, b:下, l:左, r:右）
          margin: {
            t: 30, // タイトルの位置をグラフに近づける
            b: 30, // X軸ラベルをグラフに近づける
            l: 30, // 左側の余白
            r: 30 // 右側の余白
          },
          annotations: [
            { xref: 'x', x: dStats.mean, yref: 'paper', y: 0.8, text: `mean = ${dStats.mean.toFixed(2)}`, showarrow: false },
            { xref: 'x', x: dStats.mean, yref: 'paper', y: 0.6, text: `<span style="color: #ff8c00; font-weight: bold;">${(PERCENTAGE_FACTOR - prob).toFixed(1)}% <0< ${prob.toFixed(1)}%</span>`, showarrow: false },
            { xref: 'x', x: dStats.mean, yref: 'paper', y: 0.1, text: `${dStats.lower.toFixed(2)}`, xshift: -40, showarrow: false },
            { xref: 'x', x: dStats.mean, yref: 'paper', y: 0.1, text: `${dStats.upper.toFixed(2)}`, xshift: 40, showarrow: false }
          ]
        };
        Plotly.newPlot(div, plotData, layout, { staticPlot: true });
      }
    }
  };

  // --- メイン実行フェーズ ---
  plotPosteriorDistributions(bayesianResults);
  plotIndividualHDIs(bayesianResults);
  updateSummaryTable(bayesianResults);
  plotSummaryForest(bayesianResults);
  plotDifferenceDistributions(bayesianResults);

  switchTab('summary');
  ['result-container', 'footer'].forEach(id => document.getElementById(id).style.display = 'block');
}

/**
 * 初期化処理
 */
window.addEventListener('DOMContentLoaded', () => {
  // 初期表示のテーブル生成
  updateConfirmationTable();

  const dArea = document.getElementById('denoms');
  const nArea = document.getElementById('numers');
  // リセット対象のformを取得
  const inputForm = document.getElementById('input-form');

  // テキストエリア（リアルタイムバリデーション）の監視
  if (dArea && nArea) {
    dArea.addEventListener('input', updateConfirmationTable);
    nArea.addEventListener('input', updateConfirmationTable);
  }

  // リセットボタンの監視
  if (inputForm) {
    inputForm.addEventListener('reset', () => {
      // リセット直後に再計算と表示リセット
      setTimeout(updateConfirmationTable, 0);
      document.getElementById("result-container").style.display = "none";
      document.getElementById("footer").style.display = "none";
    });
  }
});