// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';

export function contains(context: Context) {
    return (id: PineMapObject, key: any) => {
        return id.map.has(key);
    };
}

