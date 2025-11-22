// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function first(context: any) {
    return (id: PineArrayObject): any => {
        return id.array.length > 0 ? id.array[0] : context.NA;
    };
}

