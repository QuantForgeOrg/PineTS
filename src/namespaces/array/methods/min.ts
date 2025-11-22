// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function min(context: any) {
    return (id: PineArrayObject, nth: number = 0): number => {
        const sorted = [...id.array].sort((a, b) => a - b);
        return sorted[nth] ?? context.NA;
    };
}

