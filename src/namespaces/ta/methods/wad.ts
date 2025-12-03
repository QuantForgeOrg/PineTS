// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

/**
 * Williams Accumulation/Distribution (WAD)
 *
 * Formula:
 * trueHigh = math.max(high, close[1])
 * trueLow = math.min(low, close[1])
 * mom = ta.change(close)
 * gain = (mom > 0) ? close - trueLow : (mom < 0) ? close - trueHigh : 0
 * ta.cum(gain)
 */
export function wad(context: any) {
    return (_callId?: string) => {
        if (!context.taState) context.taState = {};
        const stateKey = _callId || 'wad';

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                cumulativeSum: 0,
            };
        }

        const state = context.taState[stateKey];

        const close = context.get(context.data.close, 0);
        const high = context.get(context.data.high, 0);
        const low = context.get(context.data.low, 0);
        const prevClose = context.get(context.data.close, 1);

        if (isNaN(close) || isNaN(high) || isNaN(low)) {
            return context.precision(state.cumulativeSum);
        }

        let gain = 0;

        if (!isNaN(prevClose)) {
            const trueHigh = Math.max(high, prevClose);
            const trueLow = Math.min(low, prevClose);
            const mom = close - prevClose;

            if (mom > 0) {
                gain = close - trueLow;
            } else if (mom < 0) {
                gain = close - trueHigh;
            }
        }

        state.cumulativeSum += gain;

        return context.precision(state.cumulativeSum);
    };
}

