// SPDX-License-Identifier: AGPL-3.0-only

export function sum(context: any) {
    return (source: number[], length: number) => {
        const len = Array.isArray(length) ? length[length.length - 1] : length;
        if (Array.isArray(source)) {
            // slice(-len) extracts the last 'len' elements
            // If len is larger than array length, it takes the whole array, which matches Pine behavior mostly
            return source.slice(-len).reduce((a, b) => a + b, 0);
        }
        return source;
    };
}

