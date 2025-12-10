// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function columns(context: Context) {
    return (id: PineMatrixObject) => {
        if (id.matrix.length === 0) return 0;
        return id.matrix[0].length;
    };
}

