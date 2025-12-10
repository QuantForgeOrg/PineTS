// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function swap_rows(context: Context) {
    return (id: PineMatrixObject, row1: number, row2: number) => {
        const temp = id.matrix[row1];
        id.matrix[row1] = id.matrix[row2];
        id.matrix[row2] = temp;
    };
}

