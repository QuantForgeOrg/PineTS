// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function log(context: any) {
    return (source: any) => {
        return Math.log(Series.from(source).get(0));
    };
}

