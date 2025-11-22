// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function variance(context: any) {
    return (id: PineArrayObject, biased: boolean = true): number => {
        const mean = context.array.avg(id);
        const deviations = id.array.map((x: number) => Math.pow(x - mean, 2));
        const divisor = biased ? id.array.length : id.array.length - 1;
        return context.array.sum(new PineArrayObject(deviations)) / divisor;
    };
}

