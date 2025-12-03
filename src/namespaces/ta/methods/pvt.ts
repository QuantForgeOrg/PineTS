// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

/**
 * Price-Volume Trend (PVT)
 *
 * The PVT function calculates the Price-Volume Trend, which is a cumulative
 * total of volume adjusted by the percentage change in price.
 *
 * Formula:
 * PVT = Previous PVT + ((Current Close - Previous Close) / Previous Close) * Volume
 *
 * @returns The PVT series
 */
export function pvt(context: any) {
    return (_callId?: string) => {
        if (!context.taState) context.taState = {};
        const stateKey = _callId || 'pvt';

        if (!context.taState[stateKey]) {
            context.taState[stateKey] = {
                cumulativeSum: 0,
            };
        }

        const state = context.taState[stateKey];

        const close = context.get(context.data.close, 0);
        const prevClose = context.get(context.data.close, 1);
        const volume = context.get(context.data.volume, 0);

        if (!isNaN(close) && !isNaN(prevClose) && !isNaN(volume) && prevClose !== 0) {
            const term = ((close - prevClose) / prevClose) * volume;
            state.cumulativeSum += term;
        }

        return context.precision(state.cumulativeSum);
    };
}

