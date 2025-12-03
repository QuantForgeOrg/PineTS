// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

/**
 * Keltner Channels Width (KCW)
 *
 * Formula:
 * basis = ta.ema(src, length)
 * span = useTrueRange ? ta.tr : (high - low)
 * rangeEma = ta.ema(span, length)
 * kcw = ((basis + rangeEma * mult) - (basis - rangeEma * mult)) / basis
 *     = (2 * rangeEma * mult) / basis
 */
export function kcw(context: any) {
    return (source: any, _length: any, _mult: any, _useTrueRange?: any, _callId?: string) => {
        const length = Series.from(_length).get(0);
        const mult = Series.from(_mult).get(0);

        let useTrueRange = true;
        if (typeof _useTrueRange === 'string') {
            //this is the _callId passed by the transpiler
            _callId = _useTrueRange;
        } else if (_useTrueRange !== undefined) {
            useTrueRange = Series.from(_useTrueRange).get(0);
        }

        if (!context.taState) context.taState = {};
        const stateKey = _callId || `kcw_${length}_${mult}_${useTrueRange}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                basisState: { prevEma: null, initSum: 0, initCount: 0 },
                rangeState: { prevEma: null, initSum: 0, initCount: 0 },
            };
        }

        const state = context.taState[stateKey];

        // Helper to update EMA state
        const updateEma = (emaState: any, value: number, period: number) => {
            if (isNaN(value)) return NaN;

            if (emaState.initCount < period) {
                emaState.initSum += value;
                emaState.initCount++;

                if (emaState.initCount === period) {
                    emaState.prevEma = emaState.initSum / period;
                    return emaState.prevEma;
                }
                return NaN;
            }

            const alpha = 2 / (period + 1);
            emaState.prevEma = value * alpha + emaState.prevEma * (1 - alpha);
            return emaState.prevEma;
        };

        // Calculate span
        let span;
        const high = context.get(context.data.high, 0);
        const low = context.get(context.data.low, 0);

        if (useTrueRange) {
            // Calculate TR
            const close1 = context.get(context.data.close, 1);
            if (isNaN(close1)) {
                span = NaN;
            } else {
                span = Math.max(high - low, Math.abs(high - close1), Math.abs(low - close1));
            }
        } else {
            span = high - low;
        }

        const currentValue = Series.from(source).get(0);
        const basis = updateEma(state.basisState, currentValue, length);
        const rangeEma = updateEma(state.rangeState, span, length);

        if (isNaN(basis) || isNaN(rangeEma)) {
            return NaN;
        }

        if (basis === 0) {
            return context.precision(0);
        }

        const kcw = (2 * rangeEma * mult) / basis;

        return context.precision(kcw);
    };
}
