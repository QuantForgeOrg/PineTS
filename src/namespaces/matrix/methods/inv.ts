// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

// Simple inverse for 2x2
function inverse(matrix: number[][]): number[][] {
    const n = matrix.length;
    if (n !== 2) return matrix.map(r => r.map(() => NaN)); // Only 2x2 supported
    
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    if (det === 0) return [[NaN, NaN], [NaN, NaN]];
    
    return [
        [matrix[1][1] / det, -matrix[0][1] / det],
        [-matrix[1][0] / det, matrix[0][0] / det]
    ];
}

export function inv(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        const cols = rows > 0 ? id.matrix[0].length : 0;
        if (rows !== cols) return new PineMatrixObject(id.type, rows, cols, NaN, context);
        
        const invMat = inverse(id.matrix);
        const newMatrix = new PineMatrixObject(id.type, rows, cols, NaN, context);
        newMatrix.matrix = invMat;
        return newMatrix;
    };
}

