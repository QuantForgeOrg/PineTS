// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function push(context: any) {
    return (id: PineArrayObject, value: any) => {
        id.array.push(value);
    };
}

