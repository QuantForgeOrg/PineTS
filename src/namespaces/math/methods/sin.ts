// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function sin(context: any) {
    return (source: any) => {
        return Math.sin(Series.from(source).get(0));
    };
}

