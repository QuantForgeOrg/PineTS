// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function join(context: any) {
    return (id: PineArrayObject, separator: string = ','): string => {
        return id.array.join(separator);
    };
}

