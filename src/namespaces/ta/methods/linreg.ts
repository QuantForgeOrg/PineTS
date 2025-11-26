// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function linreg(context: any) {
    return (source: any, _length: any, _offset: any, _callId?: string) => {
        const length = Series.from(_length).get(0);
        const offset = Series.from(_offset).get(0);

        // Linear Regression
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `linreg_${length}_${offset}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        const n = length;

        // Calculate regression coefficients
        // window[0] is most recent (x = length - 1), window[length-1] is oldest (x = 0)
        for (let j = 0; j < length; j++) {
            const x = length - 1 - j; // Most recent bar has highest x value
            const y = state.window[j];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        const denominator = n * sumXX - sumX * sumX;
        if (denominator === 0) {
            return NaN;
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Pine formula: intercept + slope * (length - 1 - offset)
        const linRegValue = intercept + slope * (length - 1 - offset);

        return context.precision(linRegValue);
    };
}

