// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function reverse(context: any) {
    return (id: PineArrayObject): void => {
        id.array.reverse();
    };
}

