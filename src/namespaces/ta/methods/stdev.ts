// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function stdev(context: any) {
    return (source: any, _length: any, _bias: any = true, _callId?: string) => {
        const length = Series.from(_length).get(0);
        const bias = Series.from(_bias).get(0);

        // Standard Deviation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `stdev_${length}_${bias}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

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
        let sumSquaredDiff = 0;
        for (let i = 0; i < length; i++) {
            sumSquaredDiff += Math.pow(state.window[i] - mean, 2);
        }

        const divisor = bias ? length : length - 1;
        const stdev = Math.sqrt(sumSquaredDiff / divisor);

        return context.precision(stdev);
    };
}

