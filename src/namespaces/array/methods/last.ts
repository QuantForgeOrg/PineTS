// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function last(context: any) {
    return (id: PineArrayObject): any => {
        return id.array.length > 0 ? id.array[id.array.length - 1] : context.NA;
    };
}

