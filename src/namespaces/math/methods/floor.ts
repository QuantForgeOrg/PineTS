// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function floor(context: any) {
    return (source: any) => {
        return Math.floor(Series.from(source).get(0));
    };
}

