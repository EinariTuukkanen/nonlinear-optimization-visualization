/* Himmelblau function
 * f(x, y) = (x ^ 2 + y - 11) ^ 2 + (x + y ^ 2 - 7) ^ 2
 */
const himmelblau = generate2DFunction(
  ([x, y]) => (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2,
  '(x ^ 2 + y - 11) ^ 2 + (x + y ^ 2 - 7) ^ 2',
  '((x1 + l * d1) ^ 2 + (x2 + l * d2) - 11) ^ 2 + ((x1 + l * d1) + (x2 + l * d2) ^ 2 - 7) ^ 2',
  [{ x: 3.584428, y: -1.848126 }, { x: -2.805118, y: 3.131312 }, { x: -3.779310, y: -3.283186 }, { x: 3, y: 2 }],
  [-6, 6],
  [6, -6],
);

/* Matyas function
 * f(x, y) = 0.26 * (x ^ 2 + y ^ 2) - 0.48 * x * y
 */
const matyasFunction = generate2DFunction(
  ([x, y]) => 0.26 * (x ** 2 + y ** 2) - 0.48 * x * y,
  '0.26 * (x ^ 2 + y ^ 2) - 0.48 * x * y',
  '0.26 * ((x1 + l * d1) ^ 2 + (x2 + l * d2) ^ 2) - 0.48 * (x1 + l * d1) * (x2 + l * d2)',
  [{ x: 0, y: 0 }],
  [-10, 10],
  [10, -10],
);

/* Exponent function
 * f(x, y) = 0.26 * (x ^ 2 + y ^ 2) - 0.48 * x * y
 */
const exponentFunction = generate2DFunction(
  ([x, y]) => x * Math.exp(-(x ** 2 + y ** 2)) + (x ** 2 + y ** 2) / 20,
  'x * exp(-(x ^ 2 + y ^ 2)) + (x ^ 2 + y ^ 2) / 20',
  '(x1 + l * d1) * exp(-((x1 + l * d1) ^ 2 + (x2 + l * d2) ^ 2)) + ((x1 + l * d1) ^ 2 + (x2 + l * d2) ^ 2) / 20',
  [{ x: -0.669072, y: 0 }],
  [-20, 20],
  [20, -20],
);

/* Exponent function
 * f(x, y) = 0.26 * (x ^ 2 + y ^ 2) - 0.48 * x * y
 */
const rosenbrockFunction  = generate2DFunction(
  ([x, y]) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
  '(1 - x) ^ 2 + 100 * (y - x ^ 2) ^ 2',
  '(1 - (x1 + l * d1)) ^ 2 + 100 * ((x2 + l * d2) - (x1 + l * d1) ^ 2) ^ 2',
  [{ x: 1, y: 1 }],
  [-2, 2],
  [2, -2],
);


function generate2DFunction(fastEval, equation, stepSizeEquation, minima, xDomain, yDomain) {
  /* Helper to generate 2D functions in form f(x, y)
   * Inserts all required subfunctions as properties for the main function
   * - fastEval: function in plain js to increase performance (mathjs eval is slow)
   * - equation: function as a mathjs parseable string
   * - stepSizeEquation: function with param (x + l * d) as a mathjs parseable string
   * - minima: list of minima points [{x: x0, y: y0}]
   * - xDomain: range of x [xMin, xMax]
   * - yDomain: range of y [yMin, yMax]
   */
  const e = math.parse(equation);
  const f = (v) => {
    return fastEval(v.toArray());
  }
  f.eval = (x, y) => { return f(math.matrix([x, y])); }
  f._dx = math.derivative(e, 'x');
  f._dy = math.derivative(e, 'y');
  f._ddx = math.derivative(f._dx, 'x');
  f._ddy = math.derivative(f._dy, 'y');
  f._dxdy = math.derivative(f._dx, 'y');
  f.gradient = (v) => {
    const [x, y] = v.toArray();
    return math.matrix([f._dx.eval({ x, y }), f._dy.eval({ x, y })]);
  }
  f.hessian = (v) => {
    const [x, y] = v.toArray();
    return math.matrix(
      [[f._ddx.eval( {x, y} ), f._dxdy.eval( {x, y} )],
      [f._dxdy.eval( {x, y} ), f._ddy.eval( {x, y} )]]
    )
  }

  // Generate step size equation
  const sse = math.parse(stepSizeEquation);
  sse.dl = math.derivative(sse, 'l');
  sse.dl2 = math.derivative(sse.dl, 'l');

  f.stepSizeFunction = (x, d) => {
    const [x1, x2] = x.toArray();
    const [d1, d2] = d.toArray();

    // Generates a step size function g(l) => f(x + l * d)
    const g = l => sse.eval({x1, x2, d1, d2, l});
    g.derivative = l => sse.dl.eval({x1, x2, d1, d2, l});
    g.derivative2 = l => sse.dl2.eval({x1, x2, d1, d2, l});
    g.secureLimits = lambda => lambda;
    return g;
  }
  f.xDomain = xDomain;
  f.yDomain = yDomain;
  f.minima = minima;
  f.minValues = minima.map(p => f(math.matrix([p.x, p.y])))
  return f;
}

const visualizableFunctions = {
  himmelblau,
  matyasFunction,
  exponentFunction,
  rosenbrockFunction,
};

try {
  module.exports = {
    visualizableFunctions
  };
} catch (error) { }

/* Himmelblau
 * f(x, y) = (x ^ 2 + y - 11) ^ 2 + (x + y ^ 2 - 7) ^ 2
 * 
 * Using only javascript is approximately 100 faster than using 
 * the version generated using math js. However, the code
 * isn't as clear and easy to edit this way.
 */
/* const himmelblau = function(v) {
  const [x, y] = v.toArray();
  return (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2;
}
himmelblau.eval = function(x, y) {
  return (x ** 2 + y - 11) ** 2 + (x + y ** 2 - 7) ** 2;
}
himmelblau.gradient = function(v) {
  const [x, y] = v.toArray();
  return math.matrix([
    2 * (2 * x * (x ** 2 + y - 11) + x + y ** 2 - 7),
    2 * (x ** 2 + 2 * y * (x + y ** 2 - 7) + y - 11)
  ]);
}
himmelblau.hessian = function(v) {
  const [x, y] = v.toArray();
  return math.matrix([
    [
      4 * (x ** 2 + y - 11) + 8 * x ** 2 + 2,
      4 * x + 4 * y
    ],
    [
      4 * x + 4 * y,
      4 * (x + y ** 2 - 7) + 8 * y ** 2 + 2
    ],
  ])
}
himmelblau.stepSizeFunction = function(x, d) {
  const [x1, x2] = x.toArray();
  const [d1, d2] = d.toArray();

  const lambdaFunction = l=> ((x1 + l * d1) ** 2 + (x2 + l * d2) - 11) ** 2 + ((x1 + l * d1) + (x2 + l * d2) ** 2 - 7) ** 2;
  lambdaFunction.derivative = l => 2 * (2 * d1 * (x1 + l * d1) + d2) * ((x1 + l * d1) ** 2 - 11 + x2 + l * d2) + 2 * (d1 + 2 * d2 * (x2 + l * d2)) * (x1 - 7 + l * d1 + (x2 + l * d2) ** 2);
  lambdaFunction.derivative2 = l => 2 * ((2 * d1 * (x1 + l * d1) + d2) ** 2 + (d1 + 2 * d2 * (x2 + l * d2)) ** 2) + 4 * d1 ** 2 * ((x1 + l * d1) ** 2 - 11 + x2 + l * d2) + 4 * d2 ** 2 * (x1 - 7 + l * d1 + (x2 + l * d2) ** 2);
  lambdaFunction.secureLimits = l => l;

  return lambdaFunction;
}
himmelblau.minima = [
  {x : 3.584428, y : -1.848126},
  {x : -2.805118, y : 3.131312},
  {x : -3.779310, y : -3.283186},
  {x : 3, y : 2}
];
himmelblau.minValues = himmelblau.minima.map(p => himmelblau(math.matrix([p.x, p.y])));
himmelblau.xDomain = [-6, 6];
himmelblau.yDomain = [6, -6]; */