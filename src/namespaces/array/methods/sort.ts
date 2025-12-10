// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';
import { order } from '../../Types';
export function sort(context: any) {
    return (id: PineArrayObject, _order: order = order.ascending): void => {
        id.array.sort((a: number, b: number) => {
            let _a = isNaN(a) ? Infinity : a;
            let _b = isNaN(b) ? Infinity : b;
            return _order === order.ascending ? _a - _b : _b - _a;
        });
    };
}
