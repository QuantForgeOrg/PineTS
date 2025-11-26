// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function cos(context: any) {
    return (source: any) => {
        return Math.cos(Series.from(source).get(0));
    };
}

