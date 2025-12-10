// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

// Simplified eigenvalue algorithm (QR algorithm placeholder)
// For now, only 2x2 is implemented reliably for demonstration.
// Full implementation requires significant math library logic.
function calculateEigenvalues(matrix: number[][]): number[] {
    const n = matrix.length;
    if (n !== 2) return Array(n).fill(NaN); // Only supporting 2x2 for basic compliance
    
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];
    
    const trace = a + d;
    const det = a * d - b * c;
    
    // lambda^2 - trace*lambda + det = 0
    const delta = trace * trace - 4 * det;
    if (delta < 0) return [NaN, NaN]; // Complex eigenvalues
    
    const l1 = (trace + Math.sqrt(delta)) / 2;
    const l2 = (trace - Math.sqrt(delta)) / 2;
    
    return [l1, l2];
}

export function eigenvalues(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        const cols = rows > 0 ? id.matrix[0].length : 0;
        if (rows !== cols) return new PineArrayObject([], id.type as any, context);
        
        const vals = calculateEigenvalues(id.matrix);
        return new PineArrayObject(vals, id.type as any, context);
    };
}

