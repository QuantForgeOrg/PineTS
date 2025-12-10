// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function remove_col(context: Context) {
    return (id: PineMatrixObject, column_index: number) => {
        const rows = id.matrix.length;
        if (rows === 0) return new PineArrayObject([], id.type as any, context);

        const removedValues = [];
        for (let i = 0; i < rows; i++) {
            const removed = id.matrix[i].splice(column_index, 1);
            removedValues.push(removed[0]);
        }
        return new PineArrayObject(removedValues, id.type as any, context);
    };
}

