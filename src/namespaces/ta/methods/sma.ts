// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function sma(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Incremental SMA calculation using rolling sum
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `sma_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0) || 0;

        // Add current value to window
        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < period) {
            // Not enough data yet
            return NaN;
        }

        if (state.window.length > period) {
            // Remove oldest value from sum
            const oldValue = state.window.pop();
            state.sum -= oldValue;
        }

        const sma = state.sum / period;
        return context.precision(sma);
    };
}
