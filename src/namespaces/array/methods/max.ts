// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function max(context: any) {
    return (id: PineArrayObject, nth: number = 0): number => {
        const sorted = [...id.array].sort((a, b) => b - a);
        return sorted[nth] ?? context.NA;
    };
}

