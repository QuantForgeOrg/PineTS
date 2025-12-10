// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function copy(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        const cols = rows > 0 ? id.matrix[0].length : 0;
        const newMatrix = new PineMatrixObject(id.type, rows, cols, NaN, context);
        
        // Deep copy the array of arrays structure
        newMatrix.matrix = id.matrix.map(row => [...row]);
        return newMatrix;
    };
}

