// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function unshift(context: any) {
    return (id: PineArrayObject, value: any): void => {
        id.array.unshift(value);
    };
}

