// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function roc(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Series.from(_length).get(0);

        // ROC = ((current - previous) / previous) * 100
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `roc_${length}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);

        state.window.unshift(currentValue);

        if (state.window.length <= length) {
            return NaN;
        }

        if (state.window.length > length + 1) {
            state.window.pop();
        }

        const prevValue = state.window[length];
        const roc = ((currentValue - prevValue) / prevValue) * 100;
        return context.precision(roc);
    };
}

