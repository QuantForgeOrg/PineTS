// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: number = 0) => {
        if (Array.isArray(source)) {
            return [source[index]];
        }
        return [source];
    };
}

