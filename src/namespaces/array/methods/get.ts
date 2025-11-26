// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function get(context: any) {
    return (id: PineArrayObject, index: number) => {
        return id.array[index];
    };
}

