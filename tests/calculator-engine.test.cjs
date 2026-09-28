const assert = require('node:assert/strict');
require('../versions/4.0.4/calculator-engine.js');

// Precedence, unary signs, right-associative powers, radians, implicit products,
// and the omitted closing parentheses accepted by the simulated calculator.
const cases = [
  ['2+3×4', '14'], ['(2+3)×4', '20'], ['−2^2', '-4'], ['2^3^2', '512'],
  ['2^−2', '0.25'], ['sin(π÷2)', '1'], ['cos(0)', '1'], ['tan(0)', '0'],
  ['ln(e)', '1'], ['log(100)', '2'], ['√(81)', '9'], ['5!', '120'], ['0!', '1'],
  ['2π', '6.28318530718'], ['2(3+4)', '14'], ['√(81', '9'],
  ['0.1+0.2', '0.3'], ['1E-7×2', '2E-7'], ['(2+3)!', '120'],
];
for (const [input, expected] of cases) assert.equal(ICSCalculator.evaluate(input), expected, input);
for (const input of ['1÷0', '√(−1)', '(1+2))', '1+', 'alert(1)', '171!', '1.5!', '']) {
  assert.throws(() => ICSCalculator.evaluate(input), undefined, input);
}
console.log(`${cases.length} expression cases and 8 invalid inputs passed`);
