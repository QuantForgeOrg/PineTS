// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function remove_row(context: Context) {
    return (id: PineMatrixObject, row_index: number) => {
        const removed = id.matrix.splice(row_index, 1);
        return new PineArrayObject(removed[0] || [], id.type as any, context);
    };
}

