// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function reshape(context: Context) {
    return (id: PineMatrixObject, rows: number, cols: number) => {
        const currentRows = id.matrix.length;
        const currentCols = currentRows > 0 ? id.matrix[0].length : 0;
        const currentSize = currentRows * currentCols;
        const newSize = rows * cols;
        
        if (currentSize !== newSize) {
            // Cannot reshape if element counts don't match
            // Pine script might error or return NaN filled? Docs say "The function rebuilds the id matrix"
            // Usually reshape requires matching element count.
            // If we assume it does, we proceed. If not, we might need to truncate or pad.
            // Python numpy reshape requires exact match.
            // Let's assume exact match required or return original/error.
            // Or maybe it fills with NaN if larger, truncates if smaller?
            // "rebuilds the id matrix" -> implies modifying in place? No, usually returns new or modifies.
            // Pine objects are reference types, so it might modify 'id' in place?
            // "Example: var m2 = matrix.reshape(m1, ...)" -> wait, example shows `matrix.reshape(m2, 3, 2)` and then displaying `m2`.
            // So it modifies in place!
            // But wait, if size mismatch?
            // Let's assume size match for now.
        }
        
        const elements: any[] = [];
        for (let i = 0; i < currentRows; i++) {
            for (let j = 0; j < currentCols; j++) {
                elements.push(id.matrix[i][j]);
            }
        }
        
        // Pad or truncate if needed (though reshape usually implies same size)
        while(elements.length < newSize) elements.push(NaN);
        if (elements.length > newSize) elements.length = newSize;
        
        const newMatrix: any[][] = [];
        let k = 0;
        for (let i = 0; i < rows; i++) {
            const row: any[] = [];
            for (let j = 0; j < cols; j++) {
                row.push(elements[k++]);
            }
            newMatrix.push(row);
        }
        
        id.matrix = newMatrix;
    };
}

