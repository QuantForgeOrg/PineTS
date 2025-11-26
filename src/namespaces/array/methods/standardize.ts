// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function standardize(context: any) {
    return (id: PineArrayObject): PineArrayObject => {
        const mean = context.array.avg(id);
        const stdev = context.array.stdev(id);

        if (stdev === 0) {
            return new PineArrayObject(id.array.map(() => 0));
        }

        return new PineArrayObject(id.array.map((x) => (x - mean) / stdev));
    };
}

