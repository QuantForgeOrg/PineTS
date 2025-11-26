// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function acos(context: any) {
    return (source: any) => {
        return Math.acos(Series.from(source).get(0));
    };
}

