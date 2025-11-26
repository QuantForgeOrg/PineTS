// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function rma(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Incremental RMA calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `rma_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { prevRma: null, initSum: 0, initCount: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0) || 0;

        if (state.initCount < period) {
            // Accumulate for SMA initialization
            state.initSum += currentValue;
            state.initCount++;

            if (state.initCount === period) {
                state.prevRma = state.initSum / period;
                return context.precision(state.prevRma);
            }
            return NaN;
        }

        // Calculate RMA incrementally: RMA = alpha * current + (1 - alpha) * prevRMA
        const alpha = 1 / period;
        const rma = currentValue * alpha + state.prevRma * (1 - alpha);
        state.prevRma = rma;

        return context.precision(rma);
    };
}

