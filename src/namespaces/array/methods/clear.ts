// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function clear(context: any) {
    return (id: PineArrayObject): void => {
        id.array.length = 0;
    };
}

