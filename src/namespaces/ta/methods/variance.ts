// SPDX-License-Identifier: AGPL-3.0-only

export function variance(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Variance calculation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `variance_${length}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = source[source.length - 1];

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < length; i++) {
            sum += state.window[i];
            sumSquares += state.window[i] * state.window[i];
        }

        const mean = sum / length;
        const variance = sumSquares / length - mean * mean;

        return context.precision(variance);
    };
}

