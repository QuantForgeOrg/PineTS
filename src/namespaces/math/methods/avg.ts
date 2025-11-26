// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function avg(context: any) {
    return (...sources: any[]) => {
        const values = sources.map((source) => {
            // Each source is wrapped by param(), so it should be a Series
            // but check for scalar fallback
            return Series.from(source).get(0);
        });

        // Filter out NaN? No, avg propagates NaN
        // Calculate sum
        const sum = values.reduce((acc, val) => acc + val, 0);
        return sum / values.length;
    };
}

