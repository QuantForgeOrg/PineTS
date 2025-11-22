// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function slice(context: any) {
    return (id: PineArrayObject, start: number, end?: number): PineArrayObject => {
        const adjustedEnd = end !== undefined ? end + 1 : undefined;
        return new PineArrayObject(id.array.slice(start, adjustedEnd));
    };
}

