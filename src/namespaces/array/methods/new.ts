// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function new_fn(context: any) {
    return <T>(size: number, initial_value: T): PineArrayObject => {
        return new PineArrayObject(Array(size).fill(initial_value));
    };
}

