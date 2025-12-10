// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';

export function get(context: Context) {
    return (id: PineMapObject, key: any) => {
        const val = id.map.get(key);
        // If val is undefined (not found), return NaN (standard Pine na)
        // Note: Pine maps can't store 'na' as a value effectively if we use undefined,
        // but Pine maps also likely treat non-existent keys as returning na.
        return val === undefined ? NaN : val;
    };
}
