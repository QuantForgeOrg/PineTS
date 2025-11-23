// SPDX-License-Identifier: AGPL-3.0-only

import { PineArrayObject } from '../PineArrayObject';

export function param(context: any) {
    return (source: any, index: number = 0) => {
        if (source instanceof PineArrayObject) {
            return source;
        }
        if (Array.isArray(source)) {
            // It's a series, return the last element (current value)
            if (source.length > 0) {
                return source[source.length - 1];
            }
            return source[0];
        }
        return source;
    };
}
