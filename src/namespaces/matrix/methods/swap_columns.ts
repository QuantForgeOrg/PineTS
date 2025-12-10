// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function swap_columns(context: Context) {
    return (id: PineMatrixObject, col1: number, col2: number) => {
        const rows = id.matrix.length;
        for (let i = 0; i < rows; i++) {
            const temp = id.matrix[i][col1];
            id.matrix[i][col1] = id.matrix[i][col2];
            id.matrix[i][col2] = temp;
        }
    };
}

