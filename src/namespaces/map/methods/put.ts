// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';

export function put(context: Context) {
    return (id: PineMapObject, key: any, value: any) => {
        const prev = id.map.get(key);
        id.map.set(key, value);
        return prev === undefined ? NaN : prev;
    };
}
