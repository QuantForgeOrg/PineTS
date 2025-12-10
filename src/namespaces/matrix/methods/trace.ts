// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function trace(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return 0;
        const cols = id.matrix[0].length;
        const n = Math.min(rows, cols);
        
        let sum = 0;
        for (let i = 0; i < n; i++) {
            sum += id.matrix[i][i];
        }
        return sum;
    };
}

