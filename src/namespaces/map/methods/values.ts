// SPDX-License-Identifier: AGPL-3.0-only

import { PineMapObject } from '../PineMapObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function values(context: Context) {
    return (id: PineMapObject) => {
        const valuesArray = Array.from(id.map.values());
        return new PineArrayObject(valuesArray, id.valueType as any, context);
    };
}

