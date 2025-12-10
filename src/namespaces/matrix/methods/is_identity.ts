// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function is_identity(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return false;
        const cols = id.matrix[0].length;
        if (rows !== cols) return false;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (i === j) {
                    if (id.matrix[i][j] !== 1) return false;
                } else {
                    if (id.matrix[i][j] !== 0) return false;
                }
            }
        }
        return true;
    };
}

