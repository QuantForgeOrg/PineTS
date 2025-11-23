// SPDX-License-Identifier: AGPL-3.0-only

export function supertrend(context: any) {
    return (_factor: any, _atrPeriod: any, _callId?: string) => {
        const factor = Array.isArray(_factor) ? _factor[0] : _factor;
        const atrPeriod = Array.isArray(_atrPeriod) ? _atrPeriod[0] : _atrPeriod;

        // Incremental Supertrend calculation
        if (!context.taState) context.taState = {};
        const stateKey = `supertrend_${factor}_${atrPeriod}`;

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                prevUpperBand: null,
                prevLowerBand: null,
                prevSupertrend: null,
                prevDirection: null,
            };
        }

        const state = context.taState[stateKey];
        const high = context.data.high[context.data.high.length - 1];
        const low = context.data.low[context.data.low.length - 1];
        const close = context.data.close[context.data.close.length - 1];

        // Get ATR value (already optimized) - use derived call ID
        const atrValue = context.ta.atr(atrPeriod, _callId ? `${_callId}_atr` : undefined);

        if (isNaN(atrValue)) {
            return [[NaN, 0]];
        }

        const hl2 = (high + low) / 2;
        let upperBand = hl2 + factor * atrValue;
        let lowerBand = hl2 - factor * atrValue;

        // Adjust bands based on previous values
        if (state.prevUpperBand !== null) {
            const prevClose = context.data.close[context.data.close.length - 2];
            if (upperBand < state.prevUpperBand || prevClose > state.prevUpperBand) {
                upperBand = upperBand;
            } else {
                upperBand = state.prevUpperBand;
            }

            if (lowerBand > state.prevLowerBand || prevClose < state.prevLowerBand) {
                lowerBand = lowerBand;
            } else {
                lowerBand = state.prevLowerBand;
            }
        }

        // Determine trend direction and supertrend value
        let direction;
        let supertrend;

        if (state.prevSupertrend === null) {
            // First valid bar
            direction = close <= upperBand ? -1 : 1;
            supertrend = direction === -1 ? upperBand : lowerBand;
        } else {
            if (state.prevSupertrend === state.prevUpperBand) {
                if (close > upperBand) {
                    direction = 1;
                    supertrend = lowerBand;
                } else {
                    direction = -1;
                    supertrend = upperBand;
                }
            } else {
                if (close < lowerBand) {
                    direction = -1;
                    supertrend = upperBand;
                } else {
                    direction = 1;
                    supertrend = lowerBand;
                }
            }
        }

        // Update state
        state.prevUpperBand = upperBand;
        state.prevLowerBand = lowerBand;
        state.prevSupertrend = supertrend;
        state.prevDirection = direction;

        return [[context.precision(supertrend), direction]];
    };
}

