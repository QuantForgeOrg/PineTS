// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Negative Volume Index (NVI)
 *
 * Formula:
 * If close or close[1] is 0, nvi = nvi[1]
 * Else if volume < volume[1], nvi = nvi[1] + ((close - close[1]) / close[1]) * nvi[1]
 * Else nvi = nvi[1]
 * Initial value is 1.0
 */
export function nvi(context: any) {
    return (_callId?: string) => {
        if (!context.taState) context.taState = {};
        const stateKey = _callId || 'nvi';

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                nvi: 1.0,
            };
        }

        const state = context.taState[stateKey];

        const close = context.get(context.data.close, 0);
        const prevClose = context.get(context.data.close, 1);
        const volume = context.get(context.data.volume, 0);
        const prevVolume = context.get(context.data.volume, 1);

        // Treat NaN as 0 for nz() behavior
        const c0 = isNaN(close) ? 0 : close;
        const c1 = isNaN(prevClose) ? 0 : prevClose;
        const v0 = isNaN(volume) ? 0 : volume;
        const v1 = isNaN(prevVolume) ? 0 : prevVolume;

        if (c0 === 0 || c1 === 0) {
            // nvi remains the same (state.nvi)
        } else {
            if (v0 < v1) {
                const change = (c0 - c1) / c1;
                state.nvi = state.nvi + change * state.nvi;
            }
            // else nvi remains the same
        }

        return context.precision(state.nvi);
    };
}

