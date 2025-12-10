// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function keys(context: Context) {
    return (id: PineMapObject) => {
        const keysArray = Array.from(id.map.keys());
        return new PineArrayObject(keysArray, id.keyType as any, context);
    };
}

