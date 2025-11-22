// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function abs(context: any) {
    return (id: PineArrayObject): PineArrayObject => {
        return new PineArrayObject(id.array.map((val) => Math.abs(val)));
    };
}
