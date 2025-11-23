// SPDX-License-Identifier: AGPL-3.0-only

export function ema(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental EMA calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `ema_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { prevEma: null, initSum: 0, initCount: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = source[source.length - 1];

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
