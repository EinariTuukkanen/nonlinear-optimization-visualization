/*
 * DEFINE THE UNCONSTRAINED N-DIMENSIONAL SEARCH METHODS
 * Defined as objects that have
 * - sliderParams [object] - used for input range sliders
 * - run [function]        - the actual algorithm, takes in the target function, starting point
 *                           and params for the algorithm as well as lineSearch method and its params
 * - params [object]       - internal parameter values that the sliders control,
 *                           generated automatically from sliderParams in the end
 * 
 */
const NewtonsMethod = {
  sliderParams: defaultParams(['tolerance', 'maxIterations']),

  run: function(theta, x0, params, lineSearch, lineSearchParams) {
    const { maxIterations, tolerance } = params;

    const startTime = Date.now();  // Track performance
    const lsPerformance = { iterations: 0, duration: 0 };

    const steps = [x0];       // Save points for visualization
    let x = math.matrix(x0);  // Set starting point
    let k = 0;                // Iteration counter

    // Run the algorithm
    while (math.norm(theta.gradient(x)) > tolerance && k < maxIterations) {
      const d = math.multiply(-1, math.multiply(math.inv(theta.hessian(x)), theta.gradient(x)));
      const argmin = theta.stepSizeFunction(x, d);  // Returns 1D function of lambda
      const optima = lineSearch.run(argmin, lineSearchParams);
      x = math.add(x, math.multiply(optima.minPoint, d));

      // Track performance and steps
      lsPerformance.iterations += optima.performance.iterations;
      lsPerformance.duration += optima.performance.duration;
      steps.push(x);
      k++;
    }

    return {
      foundMinimum: testMinimum(theta, theta(x)),
      steps,
      minPoint: x,
      minValue: theta(x),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
        lineSearch: lsPerformance,
      }
    }
  }
};


const GradientDescentMethod = {
  sliderParams: defaultParams(['tolerance', 'maxIterations']),

  run: function(theta, x0, params, lineSearch, lineSearchParams) {
    const { maxIterations, tolerance } = params;

    const startTime = Date.now();  // Track performance
    const lsPerformance = { iterations: 0, duration: 0 };

    const steps = [x0];       // Save points for visualization
    let x = math.matrix(x0);  // Set starting point
    let k = 0;                // Iteration counter

    // Run the algorithm
    while (math.norm(theta.gradient(x)) > tolerance && k < maxIterations) {
      const d = math.multiply(-1, theta.gradient(x));
      const argmin = theta.stepSizeFunction(x, d);  // Returns 1D function of lambda
      const optima = lineSearch.run(argmin, lineSearchParams);
      x = math.add(x, math.multiply(optima.minPoint, d));

      // Track performance and steps
      lsPerformance.iterations += optima.performance.iterations;
      lsPerformance.duration += optima.performance.duration;
      steps.push(x);
      k++;
    }

    return {
      foundMinimum: testMinimum(theta, theta(x)),
      steps,
      minPoint: x,
      minValue: theta(x),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
        lineSearch: lsPerformance,
      }
    }
  }
};


const ConjugateGradientMethod = {
  sliderParams: defaultParams(['tolerance', 'maxIterations']),

  run: function(theta, x0, params, lineSearch, lineSearchParams) {
    const { maxIterations, tolerance } = params;

    const startTime = Date.now();  // Track performance
    const lsPerformance = { iterations: 0, duration: 0 };

    const steps = [x0];       // Save points for visualization
    let x = math.matrix(x0);  // Set starting point
    let k = 0;                // Iteration counter
    const n = 10;             // TODO: what is this?

    let d = math.multiply(-1, theta.gradient(x));
    let optima = null;

    // Run the algorithm
    while (math.norm(theta.gradient(x)) > tolerance && k < maxIterations) {
      let y = x;

      for (let j = 0; j < n; j++) {
        const yPrev = y;
        const argmin = theta.stepSizeFunction(y, d);  // Returns 1D function of lambda
        optima = lineSearch.run(argmin, lineSearchParams);
        y = math.add(y, math.multiply(optima.minPoint, d));
        const alpha = math.divide(
          math.square(math.norm(theta.gradient(y))),
          math.square(math.norm(theta.gradient(yPrev)))
        );
        d = math.add(math.multiply(-1, theta.gradient(y)), math.multiply(alpha, d));
      }

      x = y;
      d = theta.gradient(x);
      k++;

      // Track performance and steps
      lsPerformance.iterations += optima.performance.iterations;
      lsPerformance.duration += optima.performance.duration;
      steps.push(x);
    }

    return {
      foundMinimum: testMinimum(theta, theta(x)),
      steps,
      minPoint: x,
      minValue: theta(x),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
        lineSearch: lsPerformance,
      }
    }
  }
};


const HeavyBallMethod = {
  sliderParams: {
    ...defaultParams(['tolerance', 'maxIterations']),
    beta: {
      min: 0,
      max: 2,
      step: 0.1,
      value: 0.5,
    },
  },

  run: function(theta, x0, params, lineSearch, lineSearchParams) {
    const { maxIterations, tolerance, beta } = params;

    const startTime = Date.now();  // Track performance
    const lsPerformance = { iterations: 0, duration: 0 };

    const steps = [x0];       // Save points for visualization
    let x = math.matrix(x0);  // Set starting point
    let xPrev = x0;
    let k = 0;                // Iteration counter

    // Run the algorithm
    while (math.norm(theta.gradient(x)) > tolerance && k < maxIterations) {
      let tmp = x;

      const d = math.add(
        math.multiply(-1, theta.gradient(x)),
        math.multiply(beta, math.subtract(x, xPrev))
      );
      const argmin = theta.stepSizeFunction(x, d);  // Returns 1D function of lambda
      const optima = lineSearch.run(argmin, lineSearchParams);
      x = math.add(x, math.multiply(optima.minPoint, d));
      xPrev = tmp;

      // Track performance and steps
      lsPerformance.iterations += optima.performance.iterations;
      lsPerformance.duration += optima.performance.duration;
      steps.push(x);
      k++;
    }

    return {
      foundMinimum: testMinimum(theta, theta(x)),
      steps,
      minPoint: x,
      minValue: theta(x),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
        lineSearch: lsPerformance,
      }
    }
  }
};

const mainMethods = {
  NewtonsMethod,
  GradientDescentMethod,
  ConjugateGradientMethod,
  HeavyBallMethod,
};

// Generate 'params' for each method from their respective sliderParams
Object.values(mainMethods).forEach(method => {
  method.params = {};
  Object.entries(method.sliderParams).forEach(([paramName, param]) => {
    if (param.valueProperty) {
      method.params[paramName] = parseFloat(param.valueProperty(param.value));
    } else {
      method.params[paramName] = param.value
    }
  });
});

try {
  module.exports = {
    mainMethods,
  };
} catch (error) { }