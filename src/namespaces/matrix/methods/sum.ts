// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function sum(context: Context) {
    return (id: PineMatrixObject, id2: PineMatrixObject | number) => {
        const rows = id.matrix.length;
        if (rows === 0) return new PineMatrixObject(id.type, 0, 0, NaN, context);
        const cols = id.matrix[0].length;
        
        const newMatrix = new PineMatrixObject(id.type, rows, cols, NaN, context);
        
        if (id2 instanceof PineMatrixObject) {
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    const v1 = id.matrix[i][j];
                    const v2 = id2.matrix[i] && id2.matrix[i][j] !== undefined ? id2.matrix[i][j] : NaN;
                    newMatrix.matrix[i][j] = v1 + v2;
                }
            }
        } else {
            const scalar = id2 as number;
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    newMatrix.matrix[i][j] = id.matrix[i][j] + scalar;
                }
            }
        }
        
        return newMatrix;
    };
}
