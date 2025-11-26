// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function min(context: any) {
    return (...source: any[]) => {
        const args = source.map((e) => Series.from(e).get(0));
        return Math.min(...args);
    };
}

