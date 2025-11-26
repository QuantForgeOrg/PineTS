// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function atr(context: any) {
    return (_period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Incremental ATR calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `atr_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                prevAtr: null,
                initSum: 0,
                initCount: 0,
                prevClose: null,
            };
        }

        const state = context.taState[stateKey];
        const high = context.get(context.data.high, 0);
        const low = context.get(context.data.low, 0);
        const close = context.get(context.data.close, 0);

        // Calculate True Range
        let tr;
        if (state.prevClose !== null) {
            const hl = high - low;
            const hc = Math.abs(high - state.prevClose);
            const lc = Math.abs(low - state.prevClose);
            tr = Math.max(hl, hc, lc);
        } else {
            tr = high - low;
        }

        state.prevClose = close;

        if (state.initCount < period) {
            // Accumulate TR for SMA initialization
            state.initSum += tr;
            state.initCount++;

            if (state.initCount === period) {
                state.prevAtr = state.initSum / period;
                return context.precision(state.prevAtr);
            }
            return NaN;
        }

        // Calculate ATR using RMA formula
        const atr = (state.prevAtr * (period - 1) + tr) / period;
        state.prevAtr = atr;

        return context.precision(atr);
    };
}

