// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function asin(context: any) {
    return (source: any) => {
        return Math.asin(Series.from(source).get(0));
    };
}

