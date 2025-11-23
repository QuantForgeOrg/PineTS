// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: number = 0) => {
        if (Array.isArray(source)) {
            // Forward array: return current value (last element)
            // adjusting for index lookback if any
            return [source[source.length - 1 - index]];
        }
        return [source];
    };
}

