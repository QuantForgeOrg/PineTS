// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function range(context: any) {
    return (id: PineArrayObject): number => {
        return context.array.max(id) - context.array.min(id);
    };
}

