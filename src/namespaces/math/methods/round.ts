// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function round(context: any) {
    return (source: any) => {
        return Math.round(Series.from(source).get(0));
    };
}

