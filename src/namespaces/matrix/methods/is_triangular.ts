// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function is_triangular(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return false;
        const cols = id.matrix[0].length;
        if (rows !== cols) return false;
        
        let isUpper = true;
        let isLower = true;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i > j && id.matrix[i][j] !== 0) isUpper = false;
                if (i < j && id.matrix[i][j] !== 0) isLower = false;
            }
        }
        
        return isUpper || isLower;
    };
}

