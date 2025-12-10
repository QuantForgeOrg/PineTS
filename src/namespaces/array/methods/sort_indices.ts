// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject, PineArrayType } from '../PineArrayObject';
import { order } from '../../Types';
export function sort_indices(context: any) {
    return (id: PineArrayObject, _order: order = order.ascending): PineArrayObject => {
        const indices = id.array.map((_, index) => index);
        indices.sort((a, b) => {
            const valA = isNaN(id.array[a]) ? Infinity : id.array[a];
            const valB = isNaN(id.array[b]) ? Infinity : id.array[b];
            return _order === order.ascending ? valA - valB : valB - valA;
        });
        return new PineArrayObject(indices, PineArrayType.int, context);
    };
}
