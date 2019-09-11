// Default values for some parameters to reduce code repetition
const defaultSliderParams = {
  a: {
    min: -10,
    max: 10,
    step: 0.1,
    value: -10,
  },
  b: {
    min: -10,
    max: 10,
    step: 0.1,
    value: 10,
  },
  lambda: {
    min: -10,
    max: 10,
    step: 0.005,
    value: 1,
  },
  tolerance: {
    min: -10,
    max: 0,
    step: 1,
    value: -6,
    valueProperty: function(newValue) {
      if (newValue) { this.value = parseFloat(newValue); };
      return (10 ** this.value).toExponential(2);
    }
  },
  epsilon: {
    min: -10,
    max: 0,
    step: 1,
    value: -5,
    valueProperty: function(newValue) {
      if (newValue) { this.value = parseFloat(newValue); };
      return (10 ** this.value).toExponential(2);
    }
  },
  maxIterations: {
    min: 10,
    max: 2000,
    step: 10,
    value: 100,
  },
  gamma: {
    min: 0,
    max: 2,
    step: 0.01,
    value: 0.99,
  },
};

function updateResultMessage(status, fparams, fvalue, iterations, duration, lsIterations, lsDuration) {
  if (status) {
    $('#resultMessage').removeClass('incorrect');
    $('#resultMessage').addClass('correct');
    $('#status').text('Found correct minimum');
  } else {
    $('#resultMessage').removeClass('correct');
    $('#resultMessage').addClass('incorrect');
    $('#status').text('No minimum found');
  }
  $('#solution').text(`f(${fparams}) = ${fvalue}`);
  $('#performance').text(`in ${iterations} iterations (${duration} ms)`);
  $('#lsPerformance').text(`Line search total: ${lsIterations} iterations (${lsDuration} ms)`);
}


// Test for minimum in certain precision and help to debug
function testMinimum(fx, y) {
  // console.log(fx.correctMinValue.toFixed(6) , y.toFixed(6))
  if (isNaN(y) || y === Infinity || y === -Infinity) {
    console.warn(`Invalid minimum ${y}, ignoring.`);
    return false;
  }
  if (fx.minValues.map(x => x.toFixed(6)).indexOf(y.toFixed(6)) >= 0) return true;
  return false;
}

// Function for filtering and serving default parameters for the methods
function defaultParams(params) {
  const filteredParams = {}
  params.forEach(key => filteredParams[key] = defaultSliderParams[key]);
  return filteredParams;
}



try {
  module.exports = {
    defaultSliderParams,
    testMinimum,
    defaultParams,
  };
} catch (error) { }