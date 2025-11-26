// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function change(context: any) {
    return (source: any, _length: any = 1, _callId?: string) => {
        const length = Series.from(_length).get(0);

        // Simple lookback - store window
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `change_${length}`;

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

        const change = currentValue - state.window[length];
        return context.precision(change);
    };
}

