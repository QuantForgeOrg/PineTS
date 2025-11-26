// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function ceil(context: any) {
    return (source: any) => {
        return Math.ceil(Series.from(source).get(0));
    };
}

