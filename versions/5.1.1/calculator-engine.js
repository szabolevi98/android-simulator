/* Browser expression evaluator for the simulated AOSP calculator. No eval. */
(() => {
  'use strict';
  function evaluate(expression) {
    const source = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/√/g, 'sqrt');
    const tokens = source.match(/(?:\d+\.?\d*|\.\d+)(?:E[+-]?\d+)?|sin|cos|tan|ln|log|sqrt|[πe()+*/^!\-]/g) || [];
    if (tokens.join('') !== source || tokens.length > 256) throw new Error('Invalid expression');
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];
    function atom() {
      const token = take();
      let value;
      if (token === '(') { value = sum(); if (peek() === ')') take(); else if (peek() !== undefined) throw new Error('Missing parenthesis'); }
      else if (token === 'π') value = Math.PI;
      else if (token === 'e') value = Math.E;
      else if (/^(sin|cos|tan|ln|log|sqrt)$/.test(token || '')) {
        if (take() !== '(') throw new Error('Missing function argument');
        const argument = sum();
        if (peek() === ')') take(); else if (peek() !== undefined) throw new Error('Missing parenthesis');
        value = ({sin:Math.sin, cos:Math.cos, tan:Math.tan, ln:Math.log, log:Math.log10, sqrt:Math.sqrt})[token](argument);
      } else if (token !== undefined && /^(?:\d|\.)/.test(token)) value = Number(token);
      else throw new Error('Missing operand');
      while (peek() === '!') {
        take();
        if (!Number.isInteger(value) || value < 0 || value > 170) throw new Error('Invalid factorial');
        let result = 1; for (let i = 2; i <= value; i++) result *= i; value = result;
      }
      return value;
    }
    function power() { const value = atom(); return peek() === '^' ? (take(), value ** unary()) : value; }
    function unary() { if (peek() === '-') { take(); return -unary(); } if (peek() === '+') { take(); return unary(); } return power(); }
    function product() {
      let value = unary();
      while (peek() === '*' || peek() === '/' || /^(?:\(|π|e|sin|cos|tan|ln|log|sqrt)$/.test(peek() || '')) {
        const operator = peek() === '*' || peek() === '/' ? take() : '*';
        const right = unary(); value = operator === '*' ? value * right : value / right;
      }
      return value;
    }
    function sum() { let value = product(); while (peek() === '+' || peek() === '-') { const operator = take(), right = product(); value = operator === '+' ? value + right : value - right; } return value; }
    const result = sum();
    if (position !== tokens.length || !Number.isFinite(result)) throw new Error('Invalid result');
    return Number(result.toPrecision(12)).toString().replace('e', 'E');
  }
  globalThis.ICSCalculator = { evaluate };
})();
