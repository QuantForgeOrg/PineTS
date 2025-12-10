// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function is_binary(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return false;
        const cols = id.matrix[0].length;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const val = id.matrix[i][j];
                if (val !== 0 && val !== 1) return false;
            }
        }
        return true;
    };
}

