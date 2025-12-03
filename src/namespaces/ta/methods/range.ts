// SPDX-License-Identifier: AGPL-3.0-only

/**
 * Range
 *
 * Returns the difference between the highest and lowest values of a series over a given length.
 * Formula: ta.highest(source, length) - ta.lowest(source, length)
 */
export function range(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const h = context.pine.ta.highest(source, _length, (_callId || 'range') + '_h');
        const l = context.pine.ta.lowest(source, _length, (_callId || 'range') + '_l');

        if (isNaN(h) || isNaN(l)) {
            return NaN;
        }

        return context.precision(h - l);
    };
}

