// SPDX-License-Identifier: AGPL-3.0-only

export function dev(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Mean Absolute Deviation
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `dev_${length}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = context.taState[stateKey];
        const currentValue = source[source.length - 1] || 0;

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
