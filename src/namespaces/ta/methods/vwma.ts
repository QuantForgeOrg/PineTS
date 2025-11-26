// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function vwma(context: any) {
    return (source: any, _period: any, _callId?: string) => {
        const period = Series.from(_period).get(0);

        // Volume-Weighted Moving Average
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `vwma_${period}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [], volumeWindow: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = Series.from(source).get(0);
        const currentVolume = context.get(context.data.volume, 0);

        state.window.unshift(currentValue);
        state.volumeWindow.unshift(currentVolume);

        if (state.window.length < period) {
            return NaN;
        }

        if (state.window.length > period) {
            state.window.pop();
            state.volumeWindow.pop();
        }

        let sumVolPrice = 0;
        let sumVol = 0;
        for (let i = 0; i < period; i++) {
            sumVolPrice += state.window[i] * state.volumeWindow[i];
            sumVol += state.volumeWindow[i];
        }

        const vwma = sumVolPrice / sumVol;
        return context.precision(vwma);
    };
}

