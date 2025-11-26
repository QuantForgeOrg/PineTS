// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function fill(context: any) {
    return (id: PineArrayObject, value: any, start: number = 0, end?: number): void => {
        const length = id.array.length;
        const adjustedEnd = end !== undefined ? Math.min(end, length) : length;

        for (let i = start; i < adjustedEnd; i++) {
            id.array[i] = value;
        }
    };
}

