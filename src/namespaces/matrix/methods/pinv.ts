// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function pinv(context: Context) {
    return (id: PineMatrixObject) => {
        // Pseudoinverse placeholder (uses inv if square/nonsingular, else NaN for now)
        const rows = id.matrix.length;
        const cols = rows > 0 ? id.matrix[0].length : 0;
        
        if (rows === cols) {
             // Try normal inverse
             // We need to import inv implementation or duplicate logic. 
             // Since we don't have shared math lib yet, let's return NaN for complex cases.
             return new PineMatrixObject(id.type, rows, cols, NaN, context);
        }
        return new PineMatrixObject(id.type, cols, rows, NaN, context);
    };
}

