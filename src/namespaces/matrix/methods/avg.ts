// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function avg(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return NaN;
        const cols = id.matrix[0].length;
        if (cols === 0) return NaN;
        
        let sum = 0;
        let count = 0;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const val = id.matrix[i][j];
                if (!isNaN(val)) {
                    sum += val;
                    count++;
                }
            }
        }
        
        if (count === 0) return NaN;
        return sum / count;
    };
}

