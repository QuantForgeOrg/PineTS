// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function transpose(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return new PineMatrixObject(id.type, 0, 0, NaN, context);
        const cols = id.matrix[0].length;
        
        const newMatrix = new PineMatrixObject(id.type, cols, rows, NaN, context);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                newMatrix.matrix[j][i] = id.matrix[i][j];
            }
        }
        
        return newMatrix;
    };
}

