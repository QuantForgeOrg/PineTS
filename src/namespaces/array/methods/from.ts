// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function from(context: any) {
    return (source: any[]): PineArrayObject => {
        return new PineArrayObject([...source]);
    };
}

