// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function atan(context: any) {
    return (source: any) => {
        return Math.atan(Series.from(source).get(0));
    };
}

