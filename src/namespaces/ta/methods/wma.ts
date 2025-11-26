// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function wma(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Weighted Moving Average
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `wma_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        state.window.unshift(currentValue);

        if (state.window.length < period) {
            return NaN;
        }

        if (state.window.length > period) {
            state.window.pop();
        }

        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < period; i++) {
            const weight = period - i;
            numerator += state.window[i] * weight;
            denominator += weight;
        }

        const wma = numerator / denominator;
        return context.precision(wma);
    };
}

