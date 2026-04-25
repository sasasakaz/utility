
// document.getElementById("explain_posterior").style.visibility ="hidden";
// document.getElementById("explain_pA_over_pB").style.visibility ="hidden";


function calc_BE() {
    /*read obeservation data and calculate*/
  let denom_A = document.getElementById('denom_A').value;
  let denom_B = document.getElementById('denom_B').value;
  let numer_A = document.getElementById('numer_A').value;
  let numer_B = document.getElementById('numer_B').value;
  denom_A = denom_A.replace(/,/g, '');
  denom_B = denom_B.replace(/,/g, '');
  numer_A = numer_A.replace(/,/g, '');
  numer_B = numer_B.replace(/,/g, '');

  let rate_A0 = 100 * numer_A / denom_A;
  let rate_B0 = 100 * numer_B / denom_B;
  let rate_A = Math.round (rate_A0 * 1000) / 1000;
  let rate_B = Math.round (rate_B0 * 1000) / 1000;

  let obs_diff = Math.round ((rate_A0 - rate_B0) * 1000) / 1000;

  let obs_A = document.getElementById("result_obs_A");
  let obs_B = document.getElementById("result_obs_B");
  let obs_AB = document.getElementById("result_obs_AB");
  let obs = document.getElementById("result_obs");


/*    result_obs_A.innerHTML = "Group A's rate in observation data : " + ctr_A + "%";
    result_obs_B.innerHTML = "Group B's rate in observation data : " + ctr_B + "%";*/

/*    result_obs_A.innerHTML = rate_A + "%";
    result_obs_B.innerHTML = rate_B + "%";*/

/*    result_obs_AB.innerHTML = obs_diff + "points";*/
/*    result_obs_AB.innerHTML = "Difference A's rate over B's in observation data : " + obs_diff + "points";*/

/*    result_obs.innerHTML = "Observation data : " + rate_A + "% , " + rate_B + "% , " + obs_diff + "points";*/

  /*bayesian modeling*/
  /*prior distributions*/
  let alpha_prior = 1;
  let beta_prior = 1;
  let num_samples = document.getElementById('samples').value;

  let alpha_A = parseFloat(alpha_prior) + parseFloat(numer_A);
  let beta_A = parseFloat(beta_prior) + parseFloat(denom_A) - parseFloat(numer_A);
  let alpha_B = parseFloat(alpha_prior) + parseFloat(numer_B);
  let beta_B = parseFloat(beta_prior) + parseFloat(denom_B) - parseFloat(numer_B);

  /*posterior_distributions_and_sampling*/
  let x_A = [];
  for (let i = 0; i < num_samples; i ++) {
    x_A[i] = 100 * jStat.beta.sample(alpha_A, beta_A);
  }
  let x_B = [];
  for (let i = 0; i < num_samples; i ++) {
    x_B[i] = 100 * jStat.beta.sample(alpha_B, beta_B);
  }

  /*plot posterior distributions*/
  let trace_A = {
    x: x_A,
    name: "Group A",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:blue',
    },
  };
  let trace_B = {
    x: x_B,
    name: "Group B",
    type: "histogram",
    opacity: 0.75,
    marker: {
      color: 'tab:orange',
    },
  };

  let data_posterior = [trace_A, trace_B];
  let layout_posterior = {
    barmode: "overlay",
    title: {
      text: "Posterior distributions of the rate",
      font: {
        color: "black",
        size: 18,
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

  Plotly.newPlot('myDiv_posterior', data_posterior, layout_posterior, {staticPlot: true});

  /*mean of posterior distributions*/
  let mean_A0 = jStat.mean(x_A);
  let mean_B0 = jStat.mean(x_B);
  let mean_A = Math.round (mean_A0 * 1000000) / 1000000;
  let mean_B = Math.round (mean_B0 * 1000000) / 1000000;

/*    let result_mean_A = document.getElementById("result_mean_A");
    let result_mean_B = document.getElementById("result_mean_B");
    result_mean_A.innerHTML = mean_A;
    result_mean_B.innerHTML = mean_B;*/
  result_mean_A.innerHTML = "Mean of Group A's rate : " + mean_A + "%";
  result_mean_B.innerHTML = "Mean of Group B's rate : " + mean_B + "%";



  /*hidden and visible explaining about posterior distribution*/
  const exp_pos = document.getElementById("explain_posterior");
  exp_pos.style.visibility = "hidden";
  if ( exp_pos.style.visibility == "visible" ) {
    exp_pos.style.visibility = "hidden"; }
    else {
      exp_pos.style.visibility = "visible";
    }




  /*create absolute difference distribution*/
  let length = num_samples;
  let delta_AB = new Array(length);
  for(let i = 0; i < length; i++) {
    delta_AB[i] = x_A[i] - x_B[i];
  }

  let delta_AB_plus = delta_AB.filter(elm => {
    return elm > 0
  })

  let pA_over_pB0 = 100 * delta_AB_plus.length / delta_AB.length;
  let pA_over_pB = Math.round (pA_over_pB0 * 100) / 100;
  result_pA_over_pB.innerHTML = "<b>The probability A's rate is over B's : " + pA_over_pB + "%</b>";

  /*mean of posterior distribution of absolute difference of A's rate - B's*/
  let mean_delta_AB0 = jStat.mean(delta_AB);
  let mean_delta_AB = Math.round (mean_delta_AB0 * 1000) / 1000;
/*    result_mean_delta_AB.innerHTML = "The mean of the absolute difference of A's rate - B's : " + mean_delta_AB + "points";*/
  result_mean_delta_AB.innerHTML = "Mean : " + mean_delta_AB + "points";


  /*function for calculate percentile*/
  const calc_percentile = (arr, q) => {
/*        const sorted = arr.sort();*/
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

  let q025 = calc_percentile(delta_AB, .025);
  let q975 = calc_percentile(delta_AB, .975);

  let hdi95lower = Math.round (q025 * 1000) / 1000;
  let hdi95upper = Math.round (q975 * 1000) / 1000;

  result_hdi95.innerHTML = "95% HDI ( " + hdi95lower + ", " + hdi95upper + " )";
/*    result_delta_AB.innerHTML = "Mean : " + mean_delta_AB + ", 95% HDI ( " + hdi95lower + ", " + hdi95upper + " )";*/



  /*plot absolute distribution*/
  let trace_AB = {
    x: delta_AB,
    name: "absolute diff",
    type: 'histogram',
/*      histnorm: "probability density",*/
    opacity: 0.5,
    marker: {
      color: 'cyan',
    },
  };
  let data_AB = [trace_AB];
  let layout_AB = {
    barmode: "overlay",
    title: {
      text: "Probability distribution of the absolute difference of A's rate - B's",
      font: {
        color: "black",
        size: 18,
      },
    },

    xaxis: {
      title: "Value (unit:points)",
      zeroline: "True",
      zerolinecolor: "lightgray",
      zerolinewidth: 2,

    },
    yaxis: {
      title: "Density",
    },
    height: 400,
    width: 600,

    showlegend: true,
    legend: {
      title: {
        text: "Mean:" + mean_delta_AB + ", 95%HDI(" + hdi95lower + ", " + hdi95upper + ")",
      },
/*        bordercolor: "#C0C0C0",
        borderwidth: 0.5,*/
      x: 0.6,
/*        xanchor: "right",*/
      y: 1.1,
    },


/*      annotations: [{
        text: "Mean:" + mean_delta_AB + ", 95%HDI(" + hdi95lower + ", " + hdi95upper + ")",
        font: {
          size: 12
        },
        showarrow: false,
        x: hdi95upper,
        y: 1,
        align: "right",
        valign: "top"
      }],*/

    shapes: [
      {
        type: 'line',
        x0: hdi95lower,
        y0: 1,
        x1: hdi95upper,
        y1: 1,
        line: {
          color: 'pink',
          width: 5,
          dash: 'solid'
        }
      },
      {
        type: 'line',
        x0: mean_delta_AB,
        y0: -50,
        x1: mean_delta_AB,
        y1: 50,
        line: {
          color: 'blue',
          width: 5,
          dash: 'solid'
        }
      }
    ]

  };

  Plotly.newPlot('myDiv_AB', data_AB, layout_AB, {staticPlot: true});




  /*hidden and visible explaining about pA_over_pB*/
  const exp_a_o_b = document.getElementById("explain_pA_over_pB");
  exp_a_o_b.style.visibility = "hidden";
  if ( exp_a_o_b.style.visibility == "visible" ) {
    exp_a_o_b.style.visibility = "hidden"; }
    else {
      exp_a_o_b.style.visibility = "visible";
    }





}
