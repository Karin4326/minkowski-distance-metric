/**
 * Minkowski distance of order p between two numeric vectors.
 *
 * The Minkowski distance is:
 *
 *     ( sum_i |a_i - b_i|^p )^(1/p)
 *
 * for finite p >= 1. Two limits are handled explicitly rather than by
 * floating-point accident:
 *
 *   - p === 1  -> Manhattan distance
 *   - p === Infinity -> Chebyshev distance (max absolute difference)
 *
 * We reject p < 1 because the resulting function is not a metric (it
 * violates the triangle inequality), and this library is named after a
 * metric. We also reject NaN, non-finite p other than +Infinity, and
 * vectors of differing length, because silently truncating or padding
 * hides caller bugs.
 */

/**
 * True for values that are `typeof === 'number'` and finite.
 * Exported because callers validating their own inputs should not have to
 * reimplement the same guard, and because the tests assert on it directly.
 */
export function isFiniteNumber(x) {
  return typeof x === 'number' && Number.isFinite(x);
}

function assertVector(name, v) {
  if (!Array.isArray(v)) {
    throw new TypeError(`${name} must be an array of numbers`);
  }
  for (let i = 0; i < v.length; i += 1) {
    if (!isFiniteNumber(v[i])) {
      throw new TypeError(`${name}[${i}] must be a finite number`);
    }
  }
}

function assertOrder(p) {
  if (typeof p !== 'number' || Number.isNaN(p)) {
    throw new TypeError('p must be a number');
  }
  if (p === Infinity) {
    return;
  }
  if (!Number.isFinite(p)) {
    throw new TypeError('p must be finite or +Infinity');
  }
  if (p < 1) {
    throw new RangeError('p must be >= 1 for a metric');
  }
}

/**
 * Compute the Minkowski distance of order `p` between vectors `a` and `b`.
 *
 * @param {number[]} a
 * @param {number[]} b
 * @param {number} p  order, finite and >= 1, or +Infinity
 * @returns {number}
 */
export function minkowskiDistance(a, b, p) {
  assertVector('a', a);
  assertVector('b', b);
  assertOrder(p);

  if (a.length !== b.length) {
    throw new RangeError(
      `vectors must have the same length (got ${a.length} and ${b.length})`,
    );
  }

  if (a.length === 0) {
    // The empty sum is 0, so the distance between two empty vectors is 0
    // for every valid p. Returning early avoids 0 ** (1/p) surprises.
    return 0;
  }

  if (p === 1) {
    let sum = 0;
    for (let i = 0; i < a.length; i += 1) {
      sum += Math.abs(a[i] - b[i]);
    }
    return sum;
  }

  if (p === Infinity) {
    let max = 0;
    for (let i = 0; i < a.length; i += 1) {
      const d = Math.abs(a[i] - b[i]);
      if (d > max) {
        max = d;
      }
    }
    return max;
  }

  // General case. Accumulate in a plain loop; Math.hypot-style scaling is
  // unnecessary here because we only need relative accuracy, and the direct
  // form matches the mathematical definition the README documents.
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    sum += Math.pow(Math.abs(a[i] - b[i]), p);
  }
  return Math.pow(sum, 1 / p);
}
