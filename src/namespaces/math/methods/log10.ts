// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function log10(context: any) {
    return (source: any) => {
        return Math.log10(Series.from(source).get(0));
    };
}

