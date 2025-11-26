// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function remove(context: any) {
    return (id: PineArrayObject, index: number): any => {
        if (index >= 0 && index < id.array.length) {
            return id.array.splice(index, 1)[0];
        }
        return context.NA;
    };
}

