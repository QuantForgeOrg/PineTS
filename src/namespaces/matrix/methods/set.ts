// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function set(context: Context) {
    return (id: PineMatrixObject, row: number, col: number, value: any) => {
        if (!id.matrix[row]) return;
        id.matrix[row][col] = value;
    };
}

