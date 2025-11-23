// SPDX-License-Identifier: AGPL-3.0-only

export function tr(context: any) {
    return () => {
        const high = context.data.high;
        const low = context.data.low;
        const close = context.data.close;
        const i = high.length - 1;

        const val = context.math.max(high[i] - low[i], context.math.abs(high[i] - close[i - 1]), context.math.abs(low[i] - close[i - 1]));
        return val;
    };
}
