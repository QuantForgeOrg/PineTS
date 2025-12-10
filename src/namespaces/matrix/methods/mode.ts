// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';

export function mode(context: Context) {
    return (id: PineMatrixObject) => {
        const rows = id.matrix.length;
        if (rows === 0) return NaN;
        const cols = id.matrix[0].length;
        
        const counts = new Map<number, number>();
        let maxCount = 0;
        let modeVal = NaN;
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const val = id.matrix[i][j];
                if (!isNaN(val)) {
                    const count = (counts.get(val) || 0) + 1;
                    counts.set(val, count);
                    
                    if (count > maxCount) {
                        maxCount = count;
                        modeVal = val;
                    } else if (count === maxCount) {
                        if (val < modeVal) modeVal = val;
                    }
                }
            }
        }
        
        return modeVal;
    };
}

