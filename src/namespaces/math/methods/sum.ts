// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function sum(context: any) {
    return (source: any, length: any) => {
        const len = Series.from(length).get(0);
        const series = Series.from(source);

        let total = 0;
        for (let i = 0; i < len; i++) {
            const val = series.get(i);
            if (!isNaN(val)) {
                total += val;
            }
        }
        return total;
    };
}

