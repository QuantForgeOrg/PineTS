// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function set(context: any) {
    return (id: PineArrayObject, index: number, value: any) => {
        id.array[index] = value;
    };
}

