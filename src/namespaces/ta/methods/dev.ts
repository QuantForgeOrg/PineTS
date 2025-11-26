// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function dev(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Series.from(_length).get(0);

        // Mean Absolute Deviation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `dev_${length}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0) || 0;

        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            const oldValue = state.window.pop();
            state.sum -= oldValue;
        }

        const mean = state.sum / length;
        let sumDeviation = 0;
        for (let i = 0; i < length; i++) {
            sumDeviation += Math.abs(state.window[i] - mean);
        }

        const dev = sumDeviation / length;
        return context.precision(dev);
    };
}

