// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function sort_indices(context: any) {
    return (id: PineArrayObject, comparator?: (a: any, b: any) => number): PineArrayObject => {
        const indices = id.array.map((_, index) => index);
        indices.sort((a, b) => {
            const valA = id.array[a];
            const valB = id.array[b];
            return comparator ? comparator(valA, valB) : valA - valB;
        });
        return new PineArrayObject(indices);
    };
}

