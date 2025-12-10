// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function submatrix(context: Context) {
    return (id: PineMatrixObject, from_row: number, to_row: number, from_col: number, to_col: number) => {
        const rows = to_row - from_row;
        const cols = to_col - from_col;
        
        const newMatrix = new PineMatrixObject(id.type, rows, cols, NaN, context);
        
        for (let i = 0; i < rows; i++) {
            const sourceRow = from_row + i;
            if (sourceRow >= id.matrix.length) break;
            
            for (let j = 0; j < cols; j++) {
                const sourceCol = from_col + j;
                if (sourceCol >= id.matrix[sourceRow].length) break;
                
                newMatrix.matrix[i][j] = id.matrix[sourceRow][sourceCol];
            }
        }
        
        return newMatrix;
    };
}

