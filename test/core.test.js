import test from 'node:test';
import assert from 'node:assert/strict';

import { minkowskiDistance, isFiniteNumber } from '../src/core.js';

const EPS = 1e-12;

function close(actual, expected, eps = EPS) {
  assert.ok(
    Math.abs(actual - expected) < eps,
    `expected ${actual} to be within ${eps} of ${expected}`,
  );
}

test('p=1 is the Manhattan distance', () => {
  close(minkowskiDistance([1, 2, 3], [4, 6, 3], 1), 7);
});

test('p=2 is the Euclidean distance', () => {
  close(minkowskiDistance([0, 0], [3, 4], 2), 5);
});

test('p=Infinity is the Chebyshev distance', () => {
  close(minkowskiDistance([1, 5, 2], [4, 1, 2], Infinity), 4);
});

test('general p matches the closed form', () => {
  // |2|^3 + |3|^3 = 8 + 27 = 35; 35^(1/3) ~= 3.2710663101885897
  close(minkowskiDistance([0, 0], [2, 3], 3), Math.cbrt(35));
});

test('distance is zero for identical vectors', () => {
  close(minkowskiDistance([1.5, -2, 0], [1.5, -2, 0], 2.5), 0);
});

test('distance is symmetric', () => {
  const a = [1, -4, 7];
  const b = [3, 2, -1];
  for (const p of [1, 1.5, 2, 7, Infinity]) {
    close(minkowskiDistance(a, b, p), minkowskiDistance(b, a, p));
  }
});

test('empty vectors have distance zero for every valid p', () => {
  for (const p of [1, 2, Infinity]) {
    close(minkowskiDistance([], [], p), 0);
  }
});

test('single-element vectors reduce to absolute difference', () => {
  for (const p of [1, 2, 3, Infinity]) {
    close(minkowskiDistance([-7], [2], p), 9);
  }
});

test('non-integer p is accepted', () => {
  // |1|^1.5 + |1|^1.5 = 2; 2^(1/1.5) ~= 1.5874010519681994
  close(minkowskiDistance([0, 0], [1, 1], 1.5), Math.pow(2, 1 / 1.5));
});

test('p below 1 is rejected', () => {
  assert.throws(() => minkowskiDistance([0], [1], 0.5), RangeError);
  assert.throws(() => minkowskiDistance([0], [1], -1), RangeError);
});

test('NaN and -Infinity orders are rejected', () => {
  assert.throws(() => minkowskiDistance([0], [1], NaN), TypeError);
  assert.throws(() => minkowskiDistance([0], [1], -Infinity), TypeError);
});

test('non-number order is rejected', () => {
  assert.throws(() => minkowskiDistance([0], [1], '2'), TypeError);
  assert.throws(() => minkowskiDistance([0], [1], null), TypeError);
});

test('mismatched vector lengths are rejected', () => {
  assert.throws(() => minkowskiDistance([1, 2], [1], 2), RangeError);
});

test('non-array inputs are rejected', () => {
  assert.throws(() => minkowskiDistance('ab', [1, 2], 2), TypeError);
  assert.throws(() => minkowskiDistance([1, 2], null, 2), TypeError);
});

test('non-finite entries are rejected', () => {
  assert.throws(() => minkowskiDistance([1, NaN], [1, 2], 2), TypeError);
  assert.throws(() => minkowskiDistance([1, 2], [1, Infinity], 2), TypeError);
});

test('isFiniteNumber distinguishes finite numbers from everything else', () => {
  assert.equal(isFiniteNumber(0), true);
  assert.equal(isFiniteNumber(-1.5), true);
  assert.equal(isFiniteNumber(Infinity), false);
  assert.equal(isFiniteNumber(NaN), false);
  assert.equal(isFiniteNumber('1'), false);
  assert.equal(isFiniteNumber(null), false);
});
