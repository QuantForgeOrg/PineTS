// SPDX-License-Identifier: AGPL-3.0-only

import { PineMatrixObject } from '../PineMatrixObject';
import { Context } from '../../../Context.class';
import { PineArrayObject } from '../../array/PineArrayObject';

export function row(context: Context) {
    return (id: PineMatrixObject, row: number) => {
        if (!id.matrix[row]) return new PineArrayObject([], id.type as any, context);
        return new PineArrayObject([...id.matrix[row]], id.type as any, context);
    };
}

