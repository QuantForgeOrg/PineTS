// SPDX-License-Identifier: AGPL-3.0-only

export function tr(context: any) {
    return () => {
        const val = context.math.max(
            context.data.high[0] - context.data.low[0],
            context.math.abs(context.data.high[0] - context.data.close[1]),
            context.math.abs(context.data.low[0] - context.data.close[1])
        );
        return val;
    };
}

