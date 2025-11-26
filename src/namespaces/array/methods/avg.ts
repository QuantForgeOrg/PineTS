// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function avg(context: any) {
    return (id: PineArrayObject): number => {
        return context.array.sum(id) / id.array.length;
    };
}
