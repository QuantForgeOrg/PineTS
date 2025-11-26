// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function covariance(context: any) {
    return (arr1: PineArrayObject, arr2: PineArrayObject, biased: boolean = true): number => {
        if (arr1.array.length !== arr2.array.length || arr1.array.length < 2) return NaN;
        const divisor = biased ? arr1.array.length : arr1.array.length - 1;

        const mean1 = context.array.avg(arr1);
        const mean2 = context.array.avg(arr2);
        let sum = 0;

        for (let i = 0; i < arr1.array.length; i++) {
            sum += (arr1.array[i] - mean1) * (arr2.array[i] - mean2);
        }

        return sum / divisor;
    };
}

