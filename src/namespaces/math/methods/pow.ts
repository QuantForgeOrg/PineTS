// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function pow(context: any) {
    return (source: any, power: any) => {
        return Math.pow(Series.from(source).get(0), Series.from(power).get(0));
    };
}

