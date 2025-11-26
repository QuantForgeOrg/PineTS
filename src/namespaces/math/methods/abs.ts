// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function abs(context: any) {
    return (source: any) => {
        return Math.abs(Series.from(source).get(0));
    };
}

