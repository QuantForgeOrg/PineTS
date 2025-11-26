// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function pop(context: any) {
    return (id: PineArrayObject): any => {
        return id.array.pop();
    };
}

