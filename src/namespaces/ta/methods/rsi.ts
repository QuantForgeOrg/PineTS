// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function rsi(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Incremental RSI calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `rsi_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                prevValue: null,
                avgGain: 0,
                avgLoss: 0,
                initGains: [],
                initLosses: [],
            };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        // Calculate gain/loss from previous value
        if (state.prevValue !== null) {
            const diff = currentValue - state.prevValue;
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            // Accumulate gains/losses until we have 'period' values
            if (state.initGains.length < period) {
                state.initGains.push(gain);
                state.initLosses.push(loss);

                // Once we have 'period' gain/loss pairs, calculate first RSI
                if (state.initGains.length === period) {
                    // Calculate first RSI using simple averages
                    state.avgGain = state.initGains.reduce((a, b) => a + b, 0) / period;
                    state.avgLoss = state.initLosses.reduce((a, b) => a + b, 0) / period;
                    state.prevValue = currentValue;

                    const rsi = state.avgLoss === 0 ? 100 : 100 - 100 / (1 + state.avgGain / state.avgLoss);
                    return context.precision(rsi);
                }
                state.prevValue = currentValue;
                return NaN;
            }

            // Calculate RSI using smoothed averages (Wilder's smoothing)
            state.avgGain = (state.avgGain * (period - 1) + gain) / period;
            state.avgLoss = (state.avgLoss * (period - 1) + loss) / period;

            const rsi = state.avgLoss === 0 ? 100 : 100 - 100 / (1 + state.avgGain / state.avgLoss);
            state.prevValue = currentValue;
            return context.precision(rsi);
        }

        // First bar - just store the value
        state.prevValue = currentValue;
        return NaN;
    };
}

