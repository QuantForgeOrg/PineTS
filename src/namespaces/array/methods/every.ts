// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function every(context: any) {
    return (id: PineArrayObject, callback: (val: any) => boolean): boolean => {
        return id.array.every(callback);
    };
}

