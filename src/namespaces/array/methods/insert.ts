// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function insert(context: any) {
    return (id: PineArrayObject, index: number, value: any): void => {
        id.array.splice(index, 0, value);
    };
}

