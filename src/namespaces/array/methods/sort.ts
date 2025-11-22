// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function sort(context: any) {
    return (id: PineArrayObject, order: 'asc' | 'desc' = 'asc'): void => {
        id.array.sort((a, b) => (order === 'asc' ? a - b : b - a));
    };
}

