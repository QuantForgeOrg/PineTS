// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function param(context: any) {
    return (source: any, index: number = 0) => {
        const val = Series.from(source).get(index);
        return [val];
    };
}

