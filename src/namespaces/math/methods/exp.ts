// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function exp(context: any) {
    return (source: any) => {
        return Math.exp(Series.from(source).get(0));
    };
}

