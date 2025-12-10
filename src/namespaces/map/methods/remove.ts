// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';

export function remove(context: Context) {
    return (id: PineMapObject, key: any) => {
        const val = id.map.get(key);
        const existed = id.map.delete(key);
        return existed ? val : NaN;
    };
}

