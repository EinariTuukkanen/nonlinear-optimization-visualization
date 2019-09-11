/*
 * DEFINE THE LINE SEARCH METHODS
 * Defined as objects that have
 * - sliderParams [object] - used for input range sliders
 * - run [function]        - the actual algorithm, takes in the target function and params for the algorithm
 * - params [object]       - internal parameter values that the sliders control,
 *                           generated automatically from sliderParams in the end
 * 
 */
const ConstantSearch = {
  name: 'ConstantSearch',
  sliderParams: defaultParams(['lambda']),

  run: function(theta, params) {
    const startTime = Date.now();
    let { lambda } = params;

    return {
      steps: [lambda],
      minPoint: lambda,
      minValue: theta(lambda),
      performance: {
        iterations: 0,
        duration: Date.now() - startTime,
      }
    }
  }
};


const GoldenSectionSearch = {
  name: 'GoldenSectionSearch',
  sliderParams: defaultParams(['a', 'b', 'tolerance', 'maxIterations']),
  
  run: function(theta, params) {
    const startTime = Date.now();
    const { tolerance, maxIterations } = params;
    let { a, b } = params;
    const steps = [[a, b]];
    let k = 0;

    const alpha = 0.618;    // Golden ratio multiplier
    let lambda = a + (1 - alpha) * (b - a);
    let mu = a + alpha * (b - a);

    while (b - a > tolerance && k < maxIterations) {
      if (theta(lambda) > theta(mu)) {
        a = lambda;
        lambda = mu;
        mu = a + alpha * (b - a);
      } else {
        b = mu;
        mu = lambda;
        lambda = a + (1 - alpha) * (b - a);
      }
      steps.push([a, b])
      k++;
    }

    return {
      steps,
      minPoint: (a + b) / 2,
      minValue: theta((a + b) / 2),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const BisectionSearch = {
  name: 'BisectionSearch',
  sliderParams: defaultParams(['a', 'b', 'tolerance', 'maxIterations']),

  run: function(theta, params) {
    const startTime = Date.now();
    const { tolerance, maxIterations } = params;
    let { a, b } = params;
    const steps = [[a, b]];
    let k = 0;

    while (Math.abs(b - a) > tolerance && k < maxIterations) {
      const lambda = (b + a) / 2;
      const dtheta = theta.derivative(lambda)

      if (dtheta === 0) {
        break;
      } else if (dtheta > 0) {
        b = lambda;
      } else {
        a = lambda;
      }
      steps.push([a, b]);
      k++;
    }

    return {
      steps,
      minPoint: (a + b) / 2,
      minValue: theta((a + b) / 2),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const DichotomousSearch = {
  name: 'DichotomousSearch',
  sliderParams: defaultParams(['a', 'b', 'tolerance', 'epsilon', 'maxIterations']),

  run: function(theta, params) {
    const startTime = Date.now();
    const { tolerance, epsilon, maxIterations } = params;
    let { a, b } = params;
    const steps = [[a, b]];
    let k = 0;

    while (b - a > tolerance && k < maxIterations) {
      const lambda = (a + b) / 2 - epsilon;
      const mu = (a + b) / 2 + epsilon;

      if (theta(lambda) < theta(mu)) {
        b = mu;
      } else {
        a = lambda;
      }
      steps.push([a, b]);
      k++;
    }

    return {
      steps,
      minPoint: (a + b) / 2,
      minValue: theta((a + b) / 2),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const FibonacciSearch = {
  name: 'FibonacciSearch',
  sliderParams: defaultParams(['a', 'b', 'tolerance', 'epsilon', 'maxIterations']),

  run: function(theta, params) {
    function fibonacci(num){
      /* Simple method for finding n:th fibonacci number
      * Time: O(n), Space: constant */
      let a = 1, b = 0, temp;
      while (num >= 0){
        temp = a;
        a = a + b;
        b = temp;
        num--;
      }
      return b;
    }

    const startTime = Date.now();
    const { tolerance, epsilon, maxIterations } = params;
    let { a, b } = params;
    const steps = [[a, b]];
    let k = 0;

    // Calculate n with do-while loop
    // TODO: Handle case when condition is never reached?
    let n = 0;
    do { n++; } while ((b - a) / fibonacci(n) > tolerance);

    let lambda = a + fibonacci(n - 2) / fibonacci(n) * (b - a),
        mu = a + fibonacci(n - 1) / fibonacci(n) * (b - a);

    // TODO: Add iteration limiter?
    while (k <= n - 1 && k < maxIterations) {
      if (theta(lambda) > theta(mu)) {
        a = lambda;
        lambda = mu;
        mu = a + fibonacci(n - k - 1) / fibonacci(n - k) * (b - a);
      } else {
        b = mu;
        mu = lambda;
        lambda = a + fibonacci(n - k - 2) / fibonacci(n - k) * (b - a);
      }
      steps.push([a, b]);
      k++;
    }

    if (theta(lambda) > theta(mu + epsilon)) {
      a = lambda;
    } else {
      b = mu + epsilon;
    }

    return {
      steps,
      minPoint: (a + b) / 2,
      minValue: theta((a + b) / 2),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const NewtonsSearch = {
  name: 'NewtonsSearch',
  sliderParams: defaultParams(['lambda', 'tolerance', 'maxIterations']),

  run: function(theta, params) {
    const startTime = Date.now();
    const { tolerance, maxIterations } = params;
    let { lambda } = params;
    const steps = [lambda];
    let k = 0;

    while (Math.abs(theta.derivative(lambda)) > tolerance && k < maxIterations) {
      lambda = lambda - theta.derivative(lambda) / theta.derivative2(lambda);
      steps.push(lambda);
      k++;
    }

    return {
      steps,
      minPoint: lambda,
      minValue: theta(lambda),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const UniformSearch = {
  name: 'UniformSearch',
  sliderParams: {
    ...defaultParams(['a', 'b', 'tolerance', 'maxIterations']),
    intervalCount: {
      min: 1,
      max: 100,
      step: 1,
      value: 20,
    },
    intervalMultiplier: {
      min: 0,
      max: 10,
      value: 1,
      step: 0.1,
    }
  },

  run: function(theta, params) {
    const startTime = Date.now();
    const { tolerance, intervalMultiplier, maxIterations } = params;
    let { a, b, intervalCount } = params;

    const steps = [a];
    let intervalSize = (b - a) / intervalCount,
        minValue = Infinity,
        minPoint = a,
        k = 0;

    while (intervalSize > tolerance && k < maxIterations) {
      for (let i = 0; i < intervalCount; i++) {
        let x = a + i * intervalSize;
        let y = theta(x);

        // Check if new value is new minimum
        if (y < minValue) {
          minValue = y;
          minPoint = x;
          steps.push(x);
        }
      }

      // Iterate to improve accuracy
      a = minValue - intervalSize;
      b = minValue + intervalSize;
      intervalCount *= intervalMultiplier;
      intervalSize = (b - a) / intervalCount;
      k++;
    }

    return {
      steps,
      minPoint,
      minValue,
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}


const ArmijoSearch = {
  name: 'ArmijoSearch',
  sliderParams: {
    ...defaultParams(['lambda', 'maxIterations']),
    alpha: {
      min: 0,
      max: 1,
      step: 0.01,
      value: 0.01,
    },
    beta: {
      min: 0.5,
      max: 1,
      step: 0.01,
      value: 0.7,
    }
  },

  run: function(theta, params) {
    const startTime = Date.now();
    const { alpha, beta, maxIterations } = params;
    let { lambda } = params;
    const steps = [lambda];
    let k = 0;

    const theta0 = theta(0);
    const Dtheta0 = theta.derivative(0);

    let condition = (theta0 + alpha * lambda * Dtheta0);
    while (theta(lambda) > condition && k < maxIterations) {
      steps.push(lambda);
      lambda *= beta;
      condition = (theta0 + alpha * lambda * Dtheta0);
      k++;
    }

    return {
      steps,
      minPoint: lambda,
      minValue: theta(lambda),
      performance: {
        iterations: k,
        duration: Date.now() - startTime,
      }
    }
  }
}

// Export the methods in single object
const lineSearchMethods = {
  ConstantSearch,
  BisectionSearch,
  DichotomousSearch,
  FibonacciSearch,
  GoldenSectionSearch,
  NewtonsSearch,
  UniformSearch,
  ArmijoSearch,
};

// Generate 'params' for each method from their respective sliderParams
Object.values(lineSearchMethods).forEach(method => {
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
    lineSearchMethods,
  };
} catch (error) { }