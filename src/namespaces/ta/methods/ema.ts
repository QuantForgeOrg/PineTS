// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function ema(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Incremental EMA calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `ema_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { prevEma: null, initSum: 0, initCount: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        if (state.initCount < period) {
            // Accumulate for SMA initialization
            state.initSum += currentValue;
            state.initCount++;

            if (state.initCount === period) {
                state.prevEma = state.initSum / period;
                return context.precision(state.prevEma);
            }
            return NaN;
        }

        // Calculate EMA incrementally: EMA = alpha * current + (1 - alpha) * prevEMA
        const alpha = 2 / (period + 1);
        const ema = currentValue * alpha + state.prevEma * (1 - alpha);
        state.prevEma = ema;

        return context.precision(ema);
    };
}
