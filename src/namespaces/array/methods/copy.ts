// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function copy(context: any) {
    return (id: PineArrayObject): PineArrayObject => {
        return new PineArrayObject([...id.array]);
    };
}

