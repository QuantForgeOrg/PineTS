// SPDX-License-Identifier: AGPL-3.0-only

export function median(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Rolling median
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `median_${length}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = { window: [] };
        }

        const state = context.taState[stateKey];
        const currentValue = source[0];

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        const sorted = state.window.slice().sort((a, b) => a - b);
        const mid = Math.floor(length / 2);
        const median = length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

        return context.precision(median);
    };
}

