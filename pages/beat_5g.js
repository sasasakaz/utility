
function obs_chk() {
  let denoms0 = document.getElementById('denoms').value;
  let numers0 = document.getElementById('numers').value;

  denoms0 = denoms0.replace(/,/g, "");
  numers0 = numers0.replace(/,/g, "");

  denoms0 = denoms0.replace(/\s+/g, "\n");
  numers0 = numers0.replace(/\s+/g, "\n");

  const denoms = denoms0.split('\n',5);
  const numers = numers0.split('\n',5);

  for (let i = denoms.length - 1; i >= 0  ; i--) {
    if (denoms[i] === '') {
      denoms.splice(i, 1);
    }
  }

  for (let i = numers.length - 1; i >= 0  ; i--) {
    if (numers[i] === '') {
      numers.splice(i, 1);
    }
  }


  let g_length = [];
  if (denoms.length <= numers.length) {
    g_length = denoms.length;
  } else {
    g_length = numers.length;
  }

  const group_list = ['A', 'B', 'C', 'D', 'E'];
  group_list.length = g_length;

  const obs = [];
  for(let i = 0; i < g_length; i++) {
    obs[i] = Math.round((100 * numers[i] / denoms[i]) * 1000) / 1000;
  };

  dA.innerHTML = denoms[0];
  dB.innerHTML = denoms[1];
  nA.innerHTML = numers[0];
  nB.innerHTML = numers[1];
  obsA.innerHTML = obs[0];
  obsB.innerHTML = obs[1];

  if (g_length >= 3) {
    dC.innerHTML = denoms[2];
    nC.innerHTML = numers[2];
    obsC.innerHTML = obs[2];
  } else {
    dC.innerHTML = "";
    nC.innerHTML = "";
    obsC.innerHTML = "";
  }

  if (g_length >= 4) {
    dD.innerHTML = denoms[3];
    nD.innerHTML = numers[3];
    obsD.innerHTML = obs[3];
  } else {
    dD.innerHTML = "";
    nD.innerHTML = "";
    obsD.innerHTML = "";
  }

  if (g_length == 5) {
    dE.innerHTML = denoms[4];
    nE.innerHTML = numers[4];
    obsE.innerHTML = obs[4];
  } else {
    dE.innerHTML = "";
    nE.innerHTML = "";
    obsE.innerHTML = "";
  }

}




function calc_BE() {
  /*read obeservation data and calculate*/
  let denoms0 = document.getElementById('denoms').value;
  let numers0 = document.getElementById('numers').value;

  denoms0 = denoms0.replace(/,/g, "");
  numers0 = numers0.replace(/,/g, "");

  denoms0 = denoms0.replace(/\s+/g, "\n");
  numers0 = numers0.replace(/\s+/g, "\n");

  const denoms = denoms0.split('\n',5);
  const numers = numers0.split('\n',5);


  for (let i = denoms.length - 1; i >= 0  ; i--) {
    if (denoms[i] === '') {
      denoms.splice(i, 1);
    }
  }

  for (let i = numers.length - 1; i >= 0  ; i--) {
    if (numers[i] === '') {
      numers.splice(i, 1);
    }
  }


  let g_length = [];
  if (denoms.length <= numers.length) {
    g_length = denoms.length;
  } else {
    g_length = numers.length;
  }

  const group_list = ['A', 'B', 'C', 'D', 'E'];
  group_list.length = g_length;

  const obs = [];
  for(let i = 0; i < g_length; i++) {
    obs[i] = Math.round((100 * numers[i] / denoms[i]) * 1000) / 1000;
  };

  dA.innerHTML = denoms[0];
  dB.innerHTML = denoms[1];

  if (g_length >= 3) {
    dC.innerHTML = denoms[2];
    nC.innerHTML = numers[2];
    obsC.innerHTML = obs[2];
  } else {
    dC.innerHTML = "";
    nC.innerHTML = "";
    obsC.innerHTML = "";
  }

  if (g_length >= 4) {
    dD.innerHTML = denoms[3];
    nD.innerHTML = numers[3];
    obsD.innerHTML = obs[3];
  } else {
    dD.innerHTML = "";
    nD.innerHTML = "";
    obsD.innerHTML = "";
  }

  if (g_length == 5) {
    dE.innerHTML = denoms[4];
    nE.innerHTML = numers[4];
    obsE.innerHTML = obs[4];
  } else {
    dE.innerHTML = "";
    nE.innerHTML = "";
    obsE.innerHTML = "";
  }


  // dC.innerHTML = denoms[2];
  // dD.innerHTML = denoms[3];
  // dE.innerHTML = denoms[4];

  nA.innerHTML = numers[0];
  nB.innerHTML = numers[1];
  // nC.innerHTML = numers[2];
  // nD.innerHTML = numers[3];
  // nE.innerHTML = numers[4];

  obsA.innerHTML = obs[0];
  obsB.innerHTML = obs[1];
  // obsC.innerHTML = obs[2];
  // obsD.innerHTML = obs[3];
  // obsE.innerHTML = obs[4];





  /*bayesian modeling*/
  /*prior distributions*/
  const alpha_prior = 1;
  const beta_prior = 1;
  const num_samples = document.getElementById('samples').value;

  const alphas = [];
  for(let i = 0; i < g_length; i++) {
    alphas[i] = parseFloat(alpha_prior) + parseFloat(numers[i]);
  };

  const betas = [];
  for(let i = 0; i < g_length; i++) {
    betas[i] = parseFloat(beta_prior) + parseFloat(denoms[i]) - parseFloat(numers[i]);
  };


  /*posterior_distributions_and_sampling*/
  const random_samples = [];
  for (i = 0; i < g_length; i++) {
    random_samples[i] = [];
    for (j = 0; j < num_samples; j++) {
      random_samples[i][j] = 100 * jStat.beta.sample(alphas[i], betas[i]);
    }
  }


  /*plot posterior distributions*/
  let trace_A = [];
  trace_A = {
    x: random_samples[0],
    name: "Group A",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:blue',
    },
  };
  let trace_B = [];
  trace_B = {
    x: random_samples[1],
    name: "Group B",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:orange',
    },
  };
  let trace_C = [];
  trace_C = {
    x: random_samples[2],
    name: "Group C",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:cyan',
    },
  };
  let trace_D = [];
  trace_D = {
    x: random_samples[3],
    name: "Group D",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'gray',
    },
  };
  let trace_E = [];
  trace_E = {
    x: random_samples[4],
    name: "Group E",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:pink',
    },
  };


  let data_posterior = [];
  if (g_length == 5) {
    data_posterior = [trace_A, trace_B, trace_C, trace_D, trace_E];
  } else if (g_length == 4) {
    data_posterior = [trace_A, trace_B, trace_C, trace_D];
  } else if (g_length == 3) {
    data_posterior = [trace_A, trace_B, trace_C];
  } else {
    data_posterior = [trace_A, trace_B];
  }

  const layout_posterior = {
    barmode: "overlay",
    title: {
      text: "Posterior distributions of the rate",
      font: {
        color: "black",
        size: 24,
      },
    },
    xaxis: {
      title: "Value (unit:percentage)",
    },
    yaxis: {
      title: "Density",
    },
    height: 400,
    width: 600,
  };


  // div_posterior = document.getElementById("myDiv_posterior");
  // if (div_posterior) {
  // Plotly.purge('myDiv_posterior');
  // } else {;}


  Plotly.newPlot('myDiv_posterior', data_posterior, layout_posterior, {staticPlot: true});


  /*mean of posterior distributions*/
  const means = [];
  const means_round = [];
  for(let i = 0; i < g_length; i++) {
    means[i] = jStat.mean(random_samples[i]);
    means_round[i] = Math.round(means[i] * 1000000) / 1000000;
  };


  result_mean_A.innerHTML = "Mean of Group A's rate : " + means_round[0] + "%";
  result_mean_B.innerHTML = "Mean of Group B's rate : " + means_round[1] + "%";

  if (g_length >= 3) {
    result_mean_C.innerHTML = "Mean of Group C's rate : " + means_round[2] + "%";
  } else {
    result_mean_C.innerHTML = "";
  }

  if (g_length >= 4) {
    result_mean_D.innerHTML = "Mean of Group D's rate : " + means_round[3] + "%";
  } else {
    result_mean_D.innerHTML = "";
  }

  if (g_length == 5) {
    result_mean_E.innerHTML = "Mean of Group E's rate : " + means_round[4] + "%";
  } else {
    result_mean_E.innerHTML = "";
  }




  let means_desc = [];
  means_desc = means.concat();
  means_desc.sort(function(a, b) {
    return b - a;
  });

  let t0=[];
  if (means_desc[0].toString() == means[0].toString()) {
    t0 = [group_list[0], random_samples[0]];
  } else if (means_desc[0].toString() == means[1].toString()) {
    t0 = [group_list[1], random_samples[1]];
  } else if (means_desc[0].toString() == means[2].toString()) {
    t0 = [group_list[2], random_samples[2]];
  } else if (means_desc[0].toString() == means[3].toString()) {
    t0 = [group_list[3], random_samples[3]];
  } else {
    t0 = [group_list[4], random_samples[4]];
  }

  let t1=[];
  if (means_desc[1].toString() == means[0].toString()) {
    t1 = [group_list[0], random_samples[0]];
  } else if (means_desc[1].toString() == means[1].toString()) {
    t1 = [group_list[1], random_samples[1]];
  } else if (means_desc[1].toString() == means[2].toString()) {
    t1 = [group_list[2], random_samples[2]];
  } else if (means_desc[1].toString() == means[3].toString()) {
    t1 = [group_list[3], random_samples[3]];
  } else {
    t1 = [group_list[4], random_samples[4]];
  }

  let t2=[];
  if (g_length < 3) {
    ;
  } else if (means_desc[2].toString() == means[0].toString()) {
    t2 = [group_list[0], random_samples[0]];
  } else if (means_desc[2].toString() == means[1].toString()) {
    t2 = [group_list[1], random_samples[1]];
  } else if (means_desc[2].toString() == means[2].toString()) {
    t2 = [group_list[2], random_samples[2]];
  } else if (means_desc[2].toString() == means[3].toString()) {
    t2 = [group_list[3], random_samples[3]];
  } else {
    t2 = [group_list[4], random_samples[4]];
  }

  let t3=[];
  if (g_length < 4) {
    ;
  } else if (means_desc[3].toString() == means[0].toString()) {
    t3 = [group_list[0], random_samples[0]];
  } else if (means_desc[3].toString() == means[1].toString()) {
    t3 = [group_list[1], random_samples[1]];
  } else if (means_desc[3].toString() == means[2].toString()) {
    t3 = [group_list[2], random_samples[2]];
  } else if (means_desc[3].toString() == means[3].toString()) {
    t3 = [group_list[3], random_samples[3]];
  } else {
    t3 = [group_list[4], random_samples[4]];
  }

  let t4=[];
  if (g_length < 5) {
    ;
  } else if (means_desc[4].toString() == means[0].toString()) {
    t4 = [group_list[0], random_samples[0]];
  } else if (means_desc[4].toString() == means[1].toString()) {
    t4 = [group_list[1], random_samples[1]];
  } else if (means_desc[4].toString() == means[2].toString()) {
    t4 = [group_list[2], random_samples[2]];
  } else if (means_desc[4].toString() == means[3].toString()) {
    t4 = [group_list[3], random_samples[3]];
  } else {
    t4 = [group_list[4], random_samples[4]];
  }


  /*function for calculate percentile*/
  const calc_percentile = (arr, q) => {
      const sorted = arr.sort((a, b) => a - b);
      const pos = (sorted.length - 1) * q;
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
          return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
          return sorted[base];
      }
  };




  /*create absolute difference distribution*/
  /*t0_versus_t1*/
  const t0t1 = [];
  let trace_t0t1 = [];
  let data_t0t1 = [];
  let layout_t0t1 = [];

  for(let i = 0; i < num_samples; i++) {
    t0t1[i] = t0[1][i] - t1[1][i];
  }
  const t0t1_plus = t0t1.filter(elm => {
    return elm > 0
  })
  const t0_over_t1 = Math.round ((100 * t0t1_plus.length / t0t1.length) * 100) / 100;
  result_t0_over_t1.innerHTML = "<b>Probability of "+ t0[0] + " > " + t1[0] + " : " + t0_over_t1 + "%</b>";

  const t0t1_mean = Math.round (jStat.mean(t0t1) * 1000) / 1000;
  // result_t0t1_mean.innerHTML = "Mean "+ t0[0] + " > " + t1[0] + " : " + t0t1_mean + "points";
  result_t0t1_mean.innerHTML = "Mean : " + t0t1_mean + "points";

  const t0t1_hdi95lower = Math.round (calc_percentile(t0t1, .025) * 1000) / 1000;
  const t0t1_hdi95upper = Math.round (calc_percentile(t0t1, .975) * 1000) / 1000;
  result_t0t1_hdi95.innerHTML = "95% HDI ( " + t0t1_hdi95lower + ", " + t0t1_hdi95upper + " )";



  trace_t0t1 = {
    x: t0t1,
    name: "absolute diff", type: 'histogram', opacity: 0.5,
    marker: {color: 'cyan',},
  };

  data_t0t1 = [trace_t0t1];
  layout_t0t1 = {
    barmode: "overlay",
    title: { text: "Probability distribution of " + t0[0] + " - " + t1[0],
      font: { color: "black", size: 24,},},
    xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
    yaxis: { title: "Density",},
    height: 400,
    width: 600,
    showlegend: true,
    legend: { title: {text: "Mean:" + t0t1_mean + ", 95%HDI(" + t0t1_hdi95lower + ", " + t0t1_hdi95upper + ")",}, x: 0.6, y: 1.1,},

    shapes: [
      { type: 'line', x0: t0t1_hdi95lower, y0: 1, x1: t0t1_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
      { type: 'line', x0: t0t1_mean, y0: -50, x1: t0t1_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
      }]
  };

  Plotly.newPlot('myDiv_t0t1', data_t0t1, layout_t0t1, {staticPlot: true});








  /*t0_versus_t2*/

  div_t0t2 = document.getElementById("myDiv_t0t2");
  if (div_t0t2) {
  Plotly.purge('myDiv_t0t2');
  } else {;}

  // Plotly.purge('myDiv_t0t2');


  const t0t2 = [];
  let trace_t0t2 = [];
  let data_t0t2 = [];
  let layout_t0t2 = [];

  // document.getElementById("myDiv_t0t2").remove();
  // Plotly.deleteTraces('myDiv_t0t2', 0);

  if (g_length >= 3) {
    for(let i = 0; i < num_samples; i++) {
      t0t2[i] = t0[1][i] - t2[1][i];
    }
    const t0t2_plus = t0t2.filter(elm => {
      return elm > 0
    })
    const t0_over_t2 = Math.round ((100 * t0t2_plus.length / t0t2.length) * 100) / 100;
    result_t0_over_t2.innerHTML = "<b>Probability of "+ t0[0] + " > " + t2[0] + " : " + t0_over_t2 + "%</b>";

    const t0t2_mean = Math.round (jStat.mean(t0t2) * 1000) / 1000;
    // result_t0t2_mean.innerHTML = "Mean "+ t0[0] + " > " + t2[0] + " : " + t0t2_mean + "points";
    result_t0t2_mean.innerHTML = "Mean : " + t0t2_mean + "points";

    const t0t2_hdi95lower = Math.round (calc_percentile(t0t2, .025) * 1000) / 1000;
    const t0t2_hdi95upper = Math.round (calc_percentile(t0t2, .975) * 1000) / 1000;
    result_t0t2_hdi95.innerHTML = "95% HDI ( " + t0t2_hdi95lower + ", " + t0t2_hdi95upper + " )";


    trace_t0t2 = {
      x: t0t2,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'cyan',},
    };

    data_t0t2 = [trace_t0t2];
    layout_t0t2 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t0[0] + " - " + t2[0],
      font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t0t2_mean + ", 95%HDI(" + t0t2_hdi95lower + ", " + t0t2_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t0t2_hdi95lower, y0: 1, x1: t0t2_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t0t2_mean, y0: -50, x1: t0t2_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
      }]
    };
    Plotly.newPlot('myDiv_t0t2', data_t0t2, layout_t0t2, {staticPlot: true});


  } else {
    result_t0_over_t2.innerHTML = "";
    result_t0t2_mean.innerHTML = "";
    result_t0t2_hdi95.innerHTML = "";

    // document.getElementById("myDiv_t0t2").remove();


    // let div_t0t2 = [];
    // div_t0t2 = document.getElementById("myDiv_t0t2");
    // if (div_t0t2) {
    //   div_t0t2.remove();
    // } else {;}
    // div_t0t2.remove();
    // div_t0t2 = "";
    // div_t0t2.style.visibility = "hidden";
    // layout_t0t2 = {height:1, width:1,};
    // Plotly.newPlot('myDiv_t0t2', data_t0t2, layout_t0t2, {staticPlot: true});

  }





  /*t0_versus_t3*/

  div_t0t3 = document.getElementById("myDiv_t0t3");
  if (div_t0t3) {
  Plotly.purge('myDiv_t0t3');
  } else {;}

  // Plotly.purge('myDiv_t0t3');


  const t0t3 = [];
  let trace_t0t3 = [];
  let data_t0t3 = [];
  let layout_t0t3 = [];

  if (g_length >= 4) {
    for(let i = 0; i < num_samples; i++) {
      t0t3[i] = t0[1][i] - t3[1][i];
    }
    const t0t3_plus = t0t3.filter(elm => {
      return elm > 0
    })
    const t0_over_t3 = Math.round ((100 * t0t3_plus.length / t0t3.length) * 100) / 100;
    result_t0_over_t3.innerHTML = "<b>Probability of "+ t0[0] + " > " + t3[0] + " : " + t0_over_t3 + "%</b>";

    const t0t3_mean = Math.round (jStat.mean(t0t3) * 1000) / 1000;
    // result_t0t3_mean.innerHTML = "Mean "+ t0[0] + " > " + t3[0] + " : " + t0t3_mean + "points";
    result_t0t3_mean.innerHTML = "Mean : " + t0t3_mean + "points";

    const t0t3_hdi95lower = Math.round (calc_percentile(t0t3, .025) * 1000) / 1000;
    const t0t3_hdi95upper = Math.round (calc_percentile(t0t3, .975) * 1000) / 1000;
    result_t0t3_hdi95.innerHTML = "95% HDI ( " + t0t3_hdi95lower + ", " + t0t3_hdi95upper + " )";


    trace_t0t3 = {
      x: t0t3,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'cyan',},
    };

    data_t0t3 = [trace_t0t3];
    layout_t0t3 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t0[0] + " - " + t3[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t0t3_mean + ", 95%HDI(" + t0t3_hdi95lower + ", " + t0t3_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t0t3_hdi95lower, y0: 1, x1: t0t3_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t0t3_mean, y0: -50, x1: t0t3_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t0t3', data_t0t3, layout_t0t3, {staticPlot: true});





  } else {
    result_t0_over_t3.innerHTML = "";
    result_t0t3_mean.innerHTML = "";
    result_t0t3_hdi95.innerHTML = "";

    // div_t0t3 = document.getElementById("myDiv_t0t3");
    // if (div_t0t3) {
    //   div_t0t3.remove();
    // } else {;}

    // let div_t0t3 = [];
    // div_t0t3 = document.getElementById("myDiv_t0t3");
    // div_t0t3.remove();
    // div_t0t3 = "";
    // div_t0t3.style.visibility = "hidden";
  }



  /*t0_versus_t4*/

  div_t0t4 = document.getElementById("myDiv_t0t4");
  if (div_t0t4) {
  Plotly.purge('myDiv_t0t4');
  } else {;}



  const t0t4 = [];
  let trace_t0t4 = [];
  let data_t0t4 = [];
  let layout_t0t4 = [];

  if (g_length == 5) {
    for(let i = 0; i < num_samples; i++) {
      t0t4[i] = t0[1][i] - t4[1][i];
    }
    const t0t4_plus = t0t4.filter(elm => {
      return elm > 0
    })
    const t0_over_t4 = Math.round ((100 * t0t4_plus.length / t0t4.length) * 100) / 100;
    result_t0_over_t4.innerHTML = "<b>Probability of "+ t0[0] + " > " + t4[0] + " : " + t0_over_t4 + "%</b>";

    const t0t4_mean = Math.round (jStat.mean(t0t4) * 1000) / 1000;
    // result_t0t4_mean.innerHTML = "Mean "+ t0[0] + " > " + t4[0] + " : " + t0t4_mean + "points";
    result_t0t4_mean.innerHTML = "Mean : " + t0t4_mean + "points";

    const t0t4_hdi95lower = Math.round (calc_percentile(t0t4, .025) * 1000) / 1000;
    const t0t4_hdi95upper = Math.round (calc_percentile(t0t4, .975) * 1000) / 1000;
    result_t0t4_hdi95.innerHTML = "95% HDI ( " + t0t4_hdi95lower + ", " + t0t4_hdi95upper + " )";



    trace_t0t4 = {
      x: t0t4,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'cyan',},
    };

    data_t0t4 = [trace_t0t4];
    layout_t0t4 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t0[0] + " - " + t4[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t0t4_mean + ", 95%HDI(" + t0t4_hdi95lower + ", " + t0t4_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t0t4_hdi95lower, y0: 1, x1: t0t4_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t0t4_mean, y0: -50, x1: t0t4_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t0t4', data_t0t4, layout_t0t4, {staticPlot: true});





  } else {
    result_t0_over_t4.innerHTML = "";
    result_t0t4_mean.innerHTML = "";
    result_t0t4_hdi95.innerHTML = "";

    // div_t0t4 = document.getElementById("myDiv_t0t4");
    // if (div_t0t4) {
    //   div_t0t4.remove();
    // } else {;}


    // let div_t0t4 = [];
    // div_t0t4 = document.getElementById("myDiv_t0t4");
    // div_t0t4.remove();
    // div_t0t4 = "";
    // div_t0t4.style.visibility = "hidden";
  }




  /*t1_versus_t2*/

  div_t1t2 = document.getElementById("myDiv_t1t2");
  if (div_t1t2) {
  Plotly.purge('myDiv_t1t2');
  } else {;}

  // Plotly.purge('myDiv_t1t2');


  const t1t2 = [];
  let trace_t1t2 = [];
  let data_t1t2 = [];
  let layout_t1t2 = [];

  if (g_length >= 3) {
    for(let i = 0; i < num_samples; i++) {
      t1t2[i] = t1[1][i] - t2[1][i];
    }
    const t1t2_plus = t1t2.filter(elm => {
      return elm > 0
    })
    const t1_over_t2 = Math.round ((100 * t1t2_plus.length / t1t2.length) * 100) / 100;
    result_t1_over_t2.innerHTML = "<b>Probability of "+ t1[0] + " > " + t2[0] + " : " + t1_over_t2 + "%</b>";

    const t1t2_mean = Math.round (jStat.mean(t1t2) * 1000) / 1000;
    // result_t1t2_mean.innerHTML = "Mean "+ t1[0] + " > " + t2[0] + " : " + t1t2_mean + "points";
    result_t1t2_mean.innerHTML = "Mean : " + t1t2_mean + "points";

    const t1t2_hdi95lower = Math.round (calc_percentile(t1t2, .025) * 1000) / 1000;
    const t1t2_hdi95upper = Math.round (calc_percentile(t1t2, .975) * 1000) / 1000;
    result_t1t2_hdi95.innerHTML = "95% HDI ( " + t1t2_hdi95lower + ", " + t1t2_hdi95upper + " )";


    trace_t1t2 = {
      x: t1t2,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'lime',},
    };

    data_t1t2 = [trace_t1t2];
    layout_t1t2 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t1[0] + " - " + t2[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t1t2_mean + ", 95%HDI(" + t1t2_hdi95lower + ", " + t1t2_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t1t2_hdi95lower, y0: 1, x1: t1t2_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t1t2_mean, y0: -50, x1: t1t2_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t1t2', data_t1t2, layout_t1t2, {staticPlot: true});







  } else {
    result_t1_over_t2.innerHTML = "";
    result_t1t2_mean.innerHTML = "";
    result_t1t2_hdi95.innerHTML = "";

    // div_t1t2 = document.getElementById("myDiv_t1t2");
    // if (div_t1t2) {
    //   div_t1t2.remove();
    // } else {;}

    // let div_t1t2 = [];
    // div_t1t2 = document.getElementById("myDiv_t1t2");
    // div_t1t2.remove();
    // div_t1t2 = "";
    // div_t1t2.style.visibility = "hidden";
  }




  /*t1_versus_t3*/

  div_t1t3 = document.getElementById("myDiv_t1t3");
  if (div_t1t3) {
  Plotly.purge('myDiv_t1t3');
  } else {;}

  // Plotly.purge('myDiv_t1t3');


  const t1t3 = [];
  let trace_t1t3 = [];
  let data_t1t3 = [];
  let layout_t1t3 = [];

  if (g_length >= 4) {
    for(let i = 0; i < num_samples; i++) {
      t1t3[i] = t1[1][i] - t3[1][i];
    }
    const t1t3_plus = t1t3.filter(elm => {
      return elm > 0
    })
    const t1_over_t3 = Math.round ((100 * t1t3_plus.length / t1t3.length) * 100) / 100;
    result_t1_over_t3.innerHTML = "<b>Probability of "+ t1[0] + " > " + t3[0] + " : " + t1_over_t3 + "%</b>";

    const t1t3_mean = Math.round (jStat.mean(t1t3) * 1000) / 1000;
    // result_t1t3_mean.innerHTML = "Mean "+ t1[0] + " > " + t3[0] + " : " + t1t3_mean + "points";
    result_t1t3_mean.innerHTML = "Mean : " + t1t3_mean + "points";

    const t1t3_hdi95lower = Math.round (calc_percentile(t1t3, .025) * 1000) / 1000;
    const t1t3_hdi95upper = Math.round (calc_percentile(t1t3, .975) * 1000) / 1000;
    result_t1t3_hdi95.innerHTML = "95% HDI ( " + t1t3_hdi95lower + ", " + t1t3_hdi95upper + " )";



    trace_t1t3 = {
      x: t1t3,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'lime',},
    };

    data_t1t3 = [trace_t1t3];
    layout_t1t3 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t1[0] + " - " + t3[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t1t3_mean + ", 95%HDI(" + t1t3_hdi95lower + ", " + t1t3_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t1t3_hdi95lower, y0: 1, x1: t1t3_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t1t3_mean, y0: -50, x1: t1t3_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t1t3', data_t1t3, layout_t1t3, {staticPlot: true});




  } else {
    result_t1_over_t3.innerHTML = "";
    result_t1t3_mean.innerHTML = "";
    result_t1t3_hdi95.innerHTML = "";

    // div_t1t3 = document.getElementById("myDiv_t1t3");
    // if (div_t1t3) {
    //   div_t1t3.remove();
    // } else {;}

    // let div_t1t3 = [];
    // div_t1t3 = document.getElementById("myDiv_t1t3");
    // div_t1t3.remove();
    // div_t1t3 = "";
    // div_t1t3.style.visibility = "hidden";
  }




  /*t1_versus_t4*/

  div_t1t4 = document.getElementById("myDiv_t1t4");
  if (div_t1t4) {
  Plotly.purge('myDiv_t1t4');
  } else {;}

  // Plotly.purge('myDiv_t1t4');



  const t1t4 = [];
  let trace_t1t4 = [];
  let data_t1t4 = [];
  let layout_t1t4 = [];

  if (g_length == 5) {
    for(let i = 0; i < num_samples; i++) {
      t1t4[i] = t1[1][i] - t4[1][i];
    }
    const t1t4_plus = t1t4.filter(elm => {
      return elm > 0
    })
    const t1_over_t4 = Math.round ((100 * t1t4_plus.length / t1t4.length) * 100) / 100;
    result_t1_over_t4.innerHTML = "<b>Probability of "+ t1[0] + " > " + t4[0] + " : " + t1_over_t4 + "%</b>";

    const t1t4_mean = Math.round (jStat.mean(t1t4) * 1000) / 1000;
    // result_t1t4_mean.innerHTML = "Mean "+ t1[0] + " > " + t4[0] + " : " + t1t4_mean + "points";
    result_t1t4_mean.innerHTML = "Mean : " + t1t4_mean + "points";

    const t1t4_hdi95lower = Math.round (calc_percentile(t1t4, .025) * 1000) / 1000;
    const t1t4_hdi95upper = Math.round (calc_percentile(t1t4, .975) * 1000) / 1000;
    result_t1t4_hdi95.innerHTML = "95% HDI ( " + t1t4_hdi95lower + ", " + t1t4_hdi95upper + " )";



    trace_t1t4 = {
      x: t1t4,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'lime',},
    };

    data_t1t4 = [trace_t1t4];
    layout_t1t4 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t1[0] + " - " + t4[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t1t4_mean + ", 95%HDI(" + t1t4_hdi95lower + ", " + t1t4_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t1t4_hdi95lower, y0: 1, x1: t1t4_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t1t4_mean, y0: -50, x1: t1t4_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t1t4', data_t1t4, layout_t1t4, {staticPlot: true});




  } else {
    result_t1_over_t4.innerHTML = "";
    result_t1t4_mean.innerHTML = "";
    result_t1t4_hdi95.innerHTML = "";

    // div_t1t4 = document.getElementById("myDiv_t1t4");
    // if (div_t1t4) {
    //   div_t1t4.remove();
    // } else {;}

    // let div_t1t4 = [];
    // div_t1t4 = document.getElementById("myDiv_t1t4");
    // div_t1t4.remove();
    // div_t1t4 = "";
    // div_t1t4.style.visibility = "hidden";
  }




  /*t2_versus_t3*/

  div_t2t3 = document.getElementById("myDiv_t2t3");
  if (div_t2t3) {
  Plotly.purge('myDiv_t2t3');
  } else {;}

  // Plotly.purge('myDiv_t2t3');


  const t2t3 = [];
  let trace_t2t3 = [];
  let data_t2t3 = [];
  let layout_t2t3 = [];

  if (g_length >= 4) {
    for(let i = 0; i < num_samples; i++) {
      t2t3[i] = t2[1][i] - t3[1][i];
    }
    const t2t3_plus = t2t3.filter(elm => {
      return elm > 0
    })
    const t2_over_t3 = Math.round ((100 * t2t3_plus.length / t2t3.length) * 100) / 100;
    result_t2_over_t3.innerHTML = "<b>Probability of "+ t2[0] + " > " + t3[0] + " : " + t2_over_t3 + "%</b>";

    const t2t3_mean = Math.round (jStat.mean(t2t3) * 1000) / 1000;
    // result_t2t3_mean.innerHTML = "Mean "+ t2[0] + " > " + t3[0] + " : " + t2t3_mean + "points";
    result_t2t3_mean.innerHTML = "Mean : " + t2t3_mean + "points";

    const t2t3_hdi95lower = Math.round (calc_percentile(t2t3, .025) * 1000) / 1000;
    const t2t3_hdi95upper = Math.round (calc_percentile(t2t3, .975) * 1000) / 1000;
    result_t2t3_hdi95.innerHTML = "95% HDI ( " + t2t3_hdi95lower + ", " + t2t3_hdi95upper + " )";



    trace_t2t3 = {
      x: t2t3,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'skyblue',},
    };

    data_t2t3 = [trace_t2t3];
    layout_t2t3 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t2[0] + " - " + t3[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t2t3_mean + ", 95%HDI(" + t2t3_hdi95lower + ", " + t2t3_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t2t3_hdi95lower, y0: 1, x1: t2t3_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t2t3_mean, y0: -50, x1: t2t3_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t2t3', data_t2t3, layout_t2t3, {staticPlot: true});



  } else {
    result_t2_over_t3.innerHTML = "";
    result_t2t3_mean.innerHTML = "";
    result_t2t3_hdi95.innerHTML = "";

    // div_t2t3 = document.getElementById("myDiv_t2t3");
    // if (div_t2t3) {
    //   div_t2t3.remove();
    // } else {;}

    // let div_t2t3 = [];
    // div_t2t3 = document.getElementById("myDiv_t2t3");
    // div_t2t3.remove();
    // div_t2t3 = "";
    // div_t2t3.style.visibility = "hidden";
  }




  /*t2_versus_t4*/

  div_t2t4 = document.getElementById("myDiv_t2t4");
  if (div_t2t4) {
  Plotly.purge('myDiv_t2t4');
  } else {;}

  // Plotly.purge('myDiv_t2t4');



  const t2t4 = [];
  let trace_t2t4 = [];
  let data_t2t4 = [];
  let layout_t2t4 = [];

  if (g_length == 5) {
    for(let i = 0; i < num_samples; i++) {
      t2t4[i] = t2[1][i] - t4[1][i];
    }
    const t2t4_plus = t2t4.filter(elm => {
      return elm > 0
    })
    const t2_over_t4 = Math.round ((100 * t2t4_plus.length / t2t4.length) * 100) / 100;
    result_t2_over_t4.innerHTML = "<b>Probability of "+ t2[0] + " > " + t4[0] + " : " + t2_over_t4 + "%</b>";

    const t2t4_mean = Math.round (jStat.mean(t2t4) * 1000) / 1000;
    // result_t2t4_mean.innerHTML = "Mean "+ t2[0] + " > " + t4[0] + " : " + t2t4_mean + "points";
    result_t2t4_mean.innerHTML = "Mean : " + t2t4_mean + "points";

    const t2t4_hdi95lower = Math.round (calc_percentile(t2t4, .025) * 1000) / 1000;
    const t2t4_hdi95upper = Math.round (calc_percentile(t2t4, .975) * 1000) / 1000;
    result_t2t4_hdi95.innerHTML = "95% HDI ( " + t2t4_hdi95lower + ", " + t2t4_hdi95upper + " )";



    trace_t2t4 = {
      x: t2t4,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'skyblue',},
    };

    data_t2t4 = [trace_t2t4];
    layout_t2t4 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t2[0] + " - " + t4[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t2t4_mean + ", 95%HDI(" + t2t4_hdi95lower + ", " + t2t4_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t2t4_hdi95lower, y0: 1, x1: t2t4_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t2t4_mean, y0: -50, x1: t2t4_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t2t4', data_t2t4, layout_t2t4, {staticPlot: true});




  } else {
    result_t2_over_t4.innerHTML = "";
    result_t2t4_mean.innerHTML = "";
    result_t2t4_hdi95.innerHTML = "";

    // div_t2t4 = document.getElementById("myDiv_t2t4");
    // if (div_t2t4) {
    //   div_t2t4.remove();
    // } else {;}

    // let div_t2t4 = [];
    // div_t2t4 = document.getElementById("myDiv_t2t4");
    // div_t2t4.remove();
    // div_t2t4 = "";
    // div_t2t4.style.visibility = "hidden";
  }




  /*t3_versus_t4*/

  div_t3t4 = document.getElementById("myDiv_t3t4");
  if (div_t3t4) {
  Plotly.purge('myDiv_t3t4');
  } else {;}

  // Plotly.purge('myDiv_t3t4');


  const t3t4 = [];
  let trace_t3t4 = [];
  let data_t3t4 = [];
  let layout_t3t4 = [];

  if (g_length == 5) {
    for(let i = 0; i < num_samples; i++) {
      t3t4[i] = t3[1][i] - t4[1][i];
    }
    const t3t4_plus = t3t4.filter(elm => {
      return elm > 0
    })
    const t3_over_t4 = Math.round ((100 * t3t4_plus.length / t3t4.length) * 100) / 100;
    result_t3_over_t4.innerHTML = "<b>Probability of "+ t3[0] + " > " + t4[0] + " : " + t3_over_t4 + "%</b>";

    const t3t4_mean = Math.round (jStat.mean(t3t4) * 1000) / 1000;
    // result_t3t4_mean.innerHTML = "Mean "+ t3[0] + " > " + t4[0] + " : " + t3t4_mean + "points";
    result_t3t4_mean.innerHTML = "Mean : " + t3t4_mean + "points";

    const t3t4_hdi95lower = Math.round (calc_percentile(t3t4, .025) * 1000) / 1000;
    const t3t4_hdi95upper = Math.round (calc_percentile(t3t4, .975) * 1000) / 1000;
    result_t3t4_hdi95.innerHTML = "95% HDI ( " + t3t4_hdi95lower + ", " + t3t4_hdi95upper + " )";



    trace_t3t4 = {
      x: t3t4,
      name: "absolute diff", type: 'histogram', opacity: 0.5,
      marker: {color: 'turquoise',},
    };

    data_t3t4 = [trace_t3t4];
    layout_t3t4 = {
      barmode: "overlay",
      title: { text: "Probability distribution of " + t3[0] + " - " + t4[0],
        font: { color: "black", size: 24,},},
      xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
      yaxis: { title: "Density",},
      height: 400,
      width: 600,
      showlegend: true,
      legend: { title: {text: "Mean:" + t3t4_mean + ", 95%HDI(" + t3t4_hdi95lower + ", " + t3t4_hdi95upper + ")",}, x: 0.6, y: 1.1,},

      shapes: [
        { type: 'line', x0: t3t4_hdi95lower, y0: 1, x1: t3t4_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
        { type: 'line', x0: t3t4_mean, y0: -50, x1: t3t4_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
        }]
    };

    Plotly.newPlot('myDiv_t3t4', data_t3t4, layout_t3t4, {staticPlot: true});



  } else {
    result_t3_over_t4.innerHTML = "";
    result_t3t4_mean.innerHTML = "";
    result_t3t4_hdi95.innerHTML = "";

    // div_t3t4 = document.getElementById("myDiv_t3t4");
    // if (div_t3t4) {
    //   div_t3t4.remove();
    // } else {;}

    // let div_t3t4 = [];
    // div_t3t4 = document.getElementById("myDiv_t3t4");
    // div_t3t4.remove();
    // div_t3t4 = "";
    // div_t3t4.style.visibility = "hidden";
  }












  /*t0_versus_t2*/
  // let trace_t0t2 = [];
  // if (g_length >= 3) {
  //   trace_t0t2 = {
  //     x: t0t2,
  //     name: "absolute diff", type: 'histogram', opacity: 0.5,
  //     marker: {color: 'cyan',},
  //   };
  //
  //   let data_t0t2 = [trace_t0t2];
  //   let layout_t0t2 = {
  //     barmode: "overlay",
  //     title: { text: "Probability distribution of " + t0[0] + " - " + t2[0],
  //     font: { color: "black", size: 16,},},
  //     xaxis: { title: "Value (unit:points)", zeroline: "True", zerolinecolor: "lightgray", zerolinewidth: 2,},
  //     yaxis: { title: "Density",},
  //     height: 400,
  //     width: 600,
  //     showlegend: true,
  //     legend: { title: {text: "Mean:" + t0t2_mean + ", 95%HDI(" + t0t2_hdi95lower + ", " + t0t2_hdi95upper + ")",}, x: 0.6, y: 1.1,},
  //
  //     shapes: [
  //       { type: 'line', x0: t0t2_hdi95lower, y0: 1, x1: t0t2_hdi95upper, y1: 1, line: { color: 'pink', width: 5, dash: 'solid'}},
  //       { type: 'line', x0: t0t2_mean, y0: -50, x1: t0t2_mean, y1: 50, line: { color: 'blue', width: 5, dash: 'solid'}
  //     }]
  //   };
  // } else {}
  //
  // Plotly.newPlot('myDiv_t0t2', data_t0t2, layout_t0t2, {staticPlot: true});
  //
  //



  /*t0_versus_t3*/






  // /*hidden and visible explaining about posterior distribution*/
  // const obs_out = document.getElementById("obs_out");
  // obs_out.style.visibility = "hidden";
  // if ( obs_out.style.visibility == "visible" ) {
  //   obs_out.style.visibility = "hidden"; }
  //   else {
  //     obs_out.style.visibility = "visible";
  //   }

  /*hidden and visible explaining about posterior distribution*/
  const exp_pos = document.getElementById("explain_posterior");
  exp_pos.style.visibility = "hidden";
  if ( exp_pos.style.visibility == "visible" ) {
    exp_pos.style.visibility = "hidden"; }
    else {
      exp_pos.style.visibility = "visible";
    }

  /*hidden and visible explaining about pA_over_pB*/
  const exp_a_o_b = document.getElementById("explain_pA_over_pB");
  exp_a_o_b.style.visibility = "hidden";
  if ( exp_a_o_b.style.visibility == "visible" ) {
    exp_a_o_b.style.visibility = "hidden"; }
    else {
      exp_a_o_b.style.visibility = "visible";
    }


}
