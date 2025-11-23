// SPDX-License-Identifier: AGPL-3.0-only

export function highest(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Rolling maximum
        if (!context.taState) context.taState = {};
        const stateKey = _callId || `highest_${length}`;

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

        const max = Math.max(...state.window.filter((v) => !isNaN(v)));
        return context.precision(max);
    };
}
