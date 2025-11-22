// SPDX-License-Identifier: AGPL-3.0-only

export function sum(context: any) {
    return (source: number[], length: number) => {
        const len = Array.isArray(length) ? length[0] : length;
        if (Array.isArray(source)) {
            return source.slice(0, len).reduce((a, b) => a + b, 0);
        }
        return source;
    };
}

