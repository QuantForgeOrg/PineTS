// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function new_float(context: any) {
    return (size: number, initial_value: number = NaN): PineArrayObject => {
        return new PineArrayObject(Array(size).fill(initial_value));
    };
}

