// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function min(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return NaN;
        const cols = id.matrix[0].length;
        
        let minVal = Infinity;
        let found = false;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const val = id.matrix[i][j];
                if (!isNaN(val)) {
                    if (val < minVal) minVal = val;
                    found = true;
                }
            }
        }
        
        return found ? minVal : NaN;
    };
}

