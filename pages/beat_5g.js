/**
 * データの取得と整形
 */
function getTargetData() {
  // 補助関数：全角数字を半角に変換
  const toHalfWidth = (str) => str.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));

  const parseInput = (id) => {
    let raw = document.getElementById(id).value;
    raw = toHalfWidth(raw); // 全角を半角に

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
      .slice(0, 5);             // 最初の5つだけ取る
  };

  const denoms = parseInput('denoms');
  const numers = parseInput('numers');

  const len = Math.min(denoms.length, numers.length);
  return { denoms, numers, len };
}

/**
 * 入力値のリアルタイムチェック（テーブルを動的に生成）
 */
function obs_chk() {
  const { denoms, numers, len } = getTargetData();
  const table = document.getElementById('confirmation_table');
  const groupIds = ['A', 'B', 'C', 'D', 'E'];

  if (!table) return;

  let html = "";

  // ヘッダー行：項目名を横に並べる
  html += `<tr>
                <th>Group</th>
                <th>分母</th>
                <th>分子</th>
                <th>比率 (%)</th>
             </tr>`;

  // データ行：グループごとに1行作る（縦に並べる）
  for (let i = 0; i < len; i++) {
    const roundedDenom = Math.round(denoms[i]);
    const roundedNumer = Math.round(numers[i]);
    const rateRaw = (denoms[i] > 0) ? (100 * numers[i] / denoms[i]) : 0;
    const rateDisplay = rateRaw.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    html += `<tr>
                    <th style="text-align: center;">Group ${groupIds[i]}</th>
                    <td align="right">${roundedDenom.toLocaleString()}</td>
                    <td align="right">${roundedNumer.toLocaleString()}</td>
                    <td align="right">${rateDisplay}</td>
                 </tr>`;
  }

  table.innerHTML = html;
}

/**
 * ベイズ推定の実行
 */
function calc_BE() {
  const { denoms, numers, len } = getTargetData();
  if (len < 2) { return alert("推定には少なくとも2群のデータが必要にゃん。手元にデータがなければresetボタン押してサンプルデータで試してにゃん"); }

  const numSamples = parseInt(document.getElementById('samples').value);
  const groupIds = ['A', 'B', 'C', 'D', 'E'];
  const colors = ['tab:blue', 'tab:orange', 'tab:cyan', 'gray', 'tab:pink'];

  // 1. 各群のサンプリング（ベータ分布）
  const randomSamples = Array.from({ length: len }, (_, i) => {
    const alpha = 1 + numers[i];
    const beta = 1 + denoms[i] - numers[i];
    return Array.from({ length: numSamples }, () => 100 * jStat.beta.sample(alpha, beta));
  });

  // 2. 事後分布のグラフ描画
  const dataPosterior = randomSamples.map((samples, i) => {
    // 色を決める際に i % colors(上で5色指定してる) としてるのので、iが5になっても 5÷5=余り0
    // なので、配列の最初に戻ってまた1色目（インデックス0）からループで色を使う仕組み
    const currentColor = colors[i % colors.length];
    return {
      x: samples,
      name: `Group ${groupIds[i]}`,
      type: "histogram",
      histnorm: 'probability density', // percentageにする
      opacity: 0.7,
      marker: { color: currentColor }
    };
  });
  Plotly.newPlot('myDiv_posterior',
    dataPosterior, {
    barmode: "overlay",
    title: "Posterior Distributions of Rate",
    xaxis: { title: "Rate (%)" },
    yaxis: {
      title: "Density (Area integrates to 1)",
      showgrid: false
    },
    // autosize: true,
    width: 600,
    height: 350,
    /* 余白の設定（t:上, b:下, l:左, r:右）を追加 */
    margin: {
      t: 30,  /* タイトルの位置をグラフに近づける */
      b: 40,  /* X軸ラベルをグラフに近づける */
    },

  }, { staticPlot: true });

  // 3. 平均値の表示（動的に生成）
  const meanListContainer = document.getElementById('mean_results_list');
  if (meanListContainer) {
    let meanHtml = "";
    for (let i = 0; i < len; i++) {
      const meanVal = jStat.mean(randomSamples[i]).toFixed(2);
      meanHtml += `<p>Mean of Group ${groupIds[i]}: ${meanVal}%</p>`;
    }
    meanListContainer.innerHTML = meanHtml;
  };

  // 4. 2群間の比較（差の分布）
  // --- まずはコンテナの中身を空にする ---
  const container = document.getElementById('comparison_charts_container');
  container.innerHTML = "";

  for (let i = 0; i < len; i++) { // len（実際の群数）までにする
    for (let j = i + 1; j < len; j++) {

      // --- HTML要素をその場で作る ---
      const divId = `myDiv_t${i}t${j}`;

      // 新しいdivを作成
      const newDiv = document.createElement('div');
      newDiv.id = divId;
      newDiv.className = 'myDiv'; // CSS用のクラスを付与

      // テキスト出力用のpタグも中に作って入れる
      newDiv.innerHTML = `
                <p id="result_t${i}t${j}_mean"></p>
                <p id="result_t${i}t${j}_hdi"></p>
                <p id="result_t${i}_over_t${j}"></p>
            `;

      // 親コンテナに追加
      container.appendChild(newDiv);

      // --- ここからは計算ロジック ---
      const diffs = randomSamples[i].map((val, idx) => val - randomSamples[j][idx]);
      const meanDiff = jStat.mean(diffs);
      const sortedDiffs = [...diffs].sort((a, b) => a - b);
      const hdiLevel = 0.94; // ここを書き換えるだけでHDIを変更可能に
      const lowerIdx = Math.floor(numSamples * (1 - hdiLevel) / 2);
      const upperIdx = Math.floor(numSamples * (1 - (1 - hdiLevel) / 2));
      const hdi_lower = sortedDiffs[lowerIdx];
      const hdi_upper = sortedDiffs[upperIdx];
      const prob = (diffs.filter(d => d > 0).length / numSamples) * 100;
      const prob_others = 100 - prob;

      // 値の流し込み
      // document.getElementById(`result_t${i}t${j}_mean`).innerHTML = `Mean: ${meanDiff.toFixed(2)}points`;
      // document.getElementById(`result_t${i}t${j}_hdi`).innerHTML = `94% HDI: [${hdi_lower.toFixed(2)}, ${hdi_upper.toFixed(2)}]`;
      // // document.getElementById(`result_t${i}_over_t${j}`).innerHTML = `<strong>P(${groupIds[i]} > ${groupIds[j]}): ${prob.toFixed(1)}%</strong>`;

      // document.getElementById(`result_t${i}_over_t${j}`).innerHTML = `<strong style="color: #ff8c00;">${prob_others.toFixed(1)}% <0< ${prob.toFixed(1)}%</strong>`;


      // グラフ描画
      const plotData = [{
        x: diffs,
        type: 'histogram',
        histnorm: 'probability density', // percentageにする
        marker: { color: 'skyblue' },
        opacity: 0.7
      }];
      const layout = {
        title: `Diff ${groupIds[i]} - ${groupIds[j]}`,
        yaxis: {
          showgrid: false,
          showticklabels: false
        },
        shapes: [
          {
            // 94% HDIの黒い太線
            type: 'line',
            xref: 'x',
            yref: 'paper', // 縦方向を相対座標にする
            x0: hdi_lower,
            y0: 0.05,      // 底から2%くらいの高さ
            x1: hdi_upper,
            y1: 0.05,
            line: { color: 'black', width: 4 }
          },
          {
            // zerolineのオレンジの線
            type: 'line',
            xref: 'x',
            yref: 'paper',
            x0: 0,
            y0: 0,
            x1: 0,
            y1: 0.6,
            line: { color: 'orange', width: 1.5 }
          }
        ],
        autosize: true,
        height: 200,
        /* 余白の設定（t:上, b:下, l:左, r:右）を追加 */
        margin: {
          t: 30,  /* タイトルの位置をグラフに近づける */
          b: 30,  /* X軸ラベルをグラフに近づける */
          l: 30,  /* 左側の余白 */
          r: 30   /* 右側の余白 */
        },
        annotations: [
          {
            // Meanを上部に
            x: meanDiff, y: 0.8, xref: 'x', yref: 'paper',
            text: `mean=${meanDiff.toFixed(2)}`,
            showarrow: false, font: { size: 14, color: 'black' }
          },
          {
            // 確率（オレンジ）を中央に
            x: meanDiff, y: 0.6, xref: 'x', yref: 'paper',
            text: `<span style="color: #ff8c00; font-weight: bold;">${prob_others.toFixed(1)}% <0< ${prob.toFixed(1)}%</span>`,
            showarrow: false, yanchor: 'top', font: { size: 14 }
          },
          {
            // 94% HDI の文字をHDIラインの上に
            x: meanDiff, y: 0.2, xref: 'x', yref: 'paper',
            text: `94% HDI`,
            showarrow: false, yanchor: 'center', font: { size: 14 }
          },
          {
            // 94% HDI lowerをHDI lowerの上に
            x: hdi_lower, y: 0.1, xref: 'x', yref: 'paper',
            text: `${hdi_lower.toFixed(2)}`,
            showarrow: false, yanchor: 'bottom', font: { size: 14 }
          },
          {
            // 94% HDI upperをHDI upperの上に
            x: hdi_upper, y: 0.1, xref: 'x', yref: 'paper',
            text: `${hdi_upper.toFixed(2)}`,
            showarrow: false, yanchor: 'bottom', font: { size: 14 }
          },


        ],
      };
      Plotly.newPlot(divId, plotData, layout, { staticPlot: true });
    }
  }
  document.getElementById("result_container").style.display = "block";
  document.getElementById("footer").style.display = "block";
}


function switchTab(tabName) {
  // パネルの表示・非表示
  document.getElementById('posterior-content').style.display = (tabName === 'posterior') ? 'block' : 'none';
  document.getElementById('diff-content').style.display = (tabName === 'diff') ? 'block' : 'none';

  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(button => {
    button.classList.remove('active');
  });
  document.querySelector(`.tab-btn[onclick="switchTab('${tabName}')"]`).classList.add('active');
}

window.onload = function () {
  // 1. 初期表示
  obs_chk();

  const dArea = document.getElementById('denoms');
  const nArea = document.getElementById('numers');
  // リセットボタンがあるフォームを取得
  const obsForm = document.getElementById('obs_table');

  // 2. テキストエリアの監視
  if (dArea && nArea) {
    dArea.addEventListener('input', obs_chk);
    nArea.addEventListener('input', obs_chk);
  }

  // 3. リセットボタンが押された時の監視
  if (obsForm) {
    obsForm.addEventListener('reset', () => {

      // リセット直後に再計算
      setTimeout(obs_chk, 0);

      // 計算結果のエリアを隠す
      const resultContainer = document.getElementById("result_container");
      if (resultContainer) {
        resultContainer.style.display = "none";
      }

      // フッターを隠す
      const footer = document.getElementById("footer");
      if (footer) {
        footer.style.display = "none";
      }
    });
  }
};