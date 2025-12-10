// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';

export function clear(context: Context) {
    return (id: PineMapObject) => {
        id.map.clear();
    };
}

