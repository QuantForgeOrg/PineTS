// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function sqrt(context: any) {
    return (source: any) => {
        return Math.sqrt(Series.from(source).get(0));
    };
}

