// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function tan(context: any) {
    return (source: any) => {
        return Math.tan(Series.from(source).get(0));
    };
}

