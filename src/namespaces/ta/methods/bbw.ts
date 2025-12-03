// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

/**
 * Bollinger Bands Width (BBW)
 *
 * Formula:
 * basis = ta.sma(source, length)
 * dev = mult * ta.stdev(source, length)
 * bbw = (((basis + dev) - (basis - dev)) / basis) * 100
 */
export function bbw(context: any) {
    return (source: any, _length: any, _mult: any, _callId?: string) => {
        const length = Series.from(_length).get(0);
        const mult = Series.from(_mult).get(0);

        if (!context.taState) context.taState = {};
        const stateKey = _callId || `bbw_${length}_${mult}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                window: [],
                sum: 0,
            };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        if (isNaN(currentValue)) {
            return NaN;
        }

        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            const removed = state.window.pop();
            state.sum -= removed;
        }

        const basis = state.sum / length;

        let sumSqDiff = 0;
        for (let i = 0; i < length; i++) {
            const diff = state.window[i] - basis;
            sumSqDiff += diff * diff;
        }
        const variance = sumSqDiff / length;
        const stdev = Math.sqrt(variance);
        
        const dev = mult * stdev;
        
        if (basis === 0) {
             return context.precision(0);
        }

        const bbw = ((2 * dev) / basis) * 100;
        return context.precision(bbw);
    };
}

