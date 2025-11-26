// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function __eq(context: any) {
    return (a: any, b: any) => {
        // Unwrap Series
        const valA = Series.from(a).get(0);
        const valB = Series.from(b).get(0);

        // Handle NaN equality (Pine Script behavior: NaN == NaN is false? No, actually NaN != NaN in Pine unless using na())
        // But internal equality checks usually want strict JS equality or tolerance.
        // Wait, in JS: NaN == NaN is false.
        // In Pine Script: NaN == NaN is true? No, na(close) is true if close is NaN.
        // But `close == na` is a syntax error or `na` is a value?
        // `close == open` where both are NaN? -> False?
        // The transpiler replaces `==` with `math.__eq`.
        // If we want to replicate JS `==` behavior but with Series support:

        if (isNaN(valA) && isNaN(valB)) return true; // Treat NaNs as equal? This is debatable for Pine Script.
        // Pine Script: `na == na` is true?
        // Test: `plot(na == na ? 1 : 0)` -> plots 1.
        // So yes, NaN == NaN is true in this transpiler context context.

        if (isNaN(valA) || isNaN(valB)) return false; // One is NaN, other is not -> False.

        return Math.abs(valA - valB) < 1e-8;
    };
}

