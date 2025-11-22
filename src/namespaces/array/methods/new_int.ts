// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function new_int(context: any) {
    return (size: number, initial_value: number = 0): PineArrayObject => {
        return new PineArrayObject(Array(size).fill(Math.round(initial_value)));
    };
}

