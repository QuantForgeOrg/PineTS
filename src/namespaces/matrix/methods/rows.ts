// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function rows(context: Context) {
    return (id: PineMatrixObject) => {
        return id.matrix.length;
    };
}

