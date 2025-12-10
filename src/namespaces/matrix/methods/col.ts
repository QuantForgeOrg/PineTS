// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function col(context: Context) {
    return (id: PineMatrixObject, column: number) => {
        const rows = id.matrix.length;
        const result = [];
        for (let i = 0; i < rows; i++) {
            result.push(id.matrix[i][column]);
        }
        return new PineArrayObject(result, id.type as any, context);
    };
}

