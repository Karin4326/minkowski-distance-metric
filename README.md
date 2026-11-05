# minkowski-distance-metric

Computes the Minkowski distance of order `p` between two numeric vectors for arbitrary finite `p >= 1`, plus the two standard limits `p = 1` (Manhattan) and `p = Infinity` (Chebyshev).

```js
import { minkowskiDistance } from './src/index.js';

minkowskiDistance([1, 2, 3], [4, 6, 3], 1);        // 7
minkowskiDistance([0, 0], [3, 4], 2);              // 5
minkowskiDistance([1, 5, 2], [4, 1, 2], Infinity); // 4
minkowskiDistance([0, 0], [2, 3], 3);              // ~3.2710663101885897
```

## Why this exists

The Minkowski distance shows up whenever you need one knob that interpolates between Manhattan and Euclidean distance — nearest-neighbour search, clustering, anomaly scoring. Writing it inline is easy to get subtly wrong: `p = 1` and `p = Infinity` are limits, not values you can pass to `Math.pow`, and `p < 1` is not a metric at all. This library fixes one interpretation: `p` must be a number, finite and `>= 1`, or exactly `+Infinity`. Anything else throws. Vectors must be arrays of finite numbers of equal length; empty vectors are allowed and give distance `0`.

## The awkward edge

`p = Infinity` cannot be computed by the general formula — `Math.pow(x, Infinity)` is not the Chebyshev max, and `1 / Infinity` is `0`, so the general path would return `1` for every input. The implementation branches explicitly on `p === 1` and `p === Infinity` before falling through to the general power-sum form. Callers who pass `p = 0.5` expecting the fractional-distance variant will get a `RangeError`; that variant is not a metric, and the name of the library is a promise.

## API

- `minkowskiDistance(a, b, p)` — returns a `number`. Throws `TypeError` for non-array or non-finite-number inputs and for a non-number `p`; throws `RangeError` for `p < 1` or for vectors of differing length.
- `isFiniteNumber(x)` — returns `true` iff `x` is a `number` and finite. Exported so callers can pre-validate inputs with the same rule the library uses.

ESM only. No dependencies.

## Design notes

The window stores values eagerly rather than keeping running aggregates. Running
sums drift with floating point over long streams, and recomputing from a small
buffer is cheap enough that the drift is not worth the speed.

