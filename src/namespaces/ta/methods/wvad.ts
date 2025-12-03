// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Williams Variable Accumulation/Distribution (WVAD)
 *
 * Formula:
 * (close - open) / (high - low) * volume
 */
export function wvad(context: any) {
    return (_callId?: string) => {
        const close = context.get(context.data.close, 0);
        const open = context.get(context.data.open, 0);
        const high = context.get(context.data.high, 0);
        const low = context.get(context.data.low, 0);
        const volume = context.get(context.data.volume, 0);

        if (isNaN(close) || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(volume)) {
            return NaN;
        }

        const range = high - low;
        if (range === 0) {
            return context.precision(0);
        }

        const wvad = ((close - open) / range) * volume;
        return context.precision(wvad);
    };
}

