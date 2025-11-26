// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function lastindexof(context: any) {
    return (id: PineArrayObject, value: any): number => {
        return id.array.lastIndexOf(value);
    };
}

