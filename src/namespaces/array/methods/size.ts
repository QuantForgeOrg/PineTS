// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function size(context: any) {
    return (id: PineArrayObject): number => {
        return id.array.length;
    };
}

