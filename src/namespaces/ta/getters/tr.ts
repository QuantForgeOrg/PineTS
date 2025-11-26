// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function tr(context: any) {
    return () => {
        // Note: context.data.high/low/close are raw arrays now.
        // But math.max expects Series? Or values?
        // The param() wrapper for math functions handles wrapping values into Series.
        // However, direct array access [0] and [1] on raw arrays is correct for forward arrays?
        // No! In forward arrays:
        // [0] is OLDEST.
        // We need context.get(array, index).

        // But here we are inside a JS implementation of 'tr'.
        // context.data.* are the raw arrays.
        // We should use context.get() to safely access them with Pine semantics.

        const high0 = context.get(context.data.high, 0);
        const low0 = context.get(context.data.low, 0);
        const close1 = context.get(context.data.close, 1);

        if (isNaN(close1)) {
            return high0 - low0;
        }

        const val = Math.max(high0 - low0, Math.abs(high0 - close1), Math.abs(low0 - close1));
        return val;
    };
}

