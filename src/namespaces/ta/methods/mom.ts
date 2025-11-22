// SPDX-License-Identifier: AGPL-3.0-only

export function mom(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Momentum is same as change
        return context.ta.change(source, length);
    };
}

