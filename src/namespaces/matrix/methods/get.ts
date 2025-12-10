// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function get(context: Context) {
    return (id: PineMatrixObject, row: number, col: number) => {
        if (!id.matrix[row]) return NaN;
        const val = id.matrix[row][col];
        return val === undefined ? NaN : val;
    };
}

