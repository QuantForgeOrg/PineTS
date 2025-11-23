// SPDX-License-Identifier: AGPL-3.0-only

export function floor(context: any) {
    return (source: number[]) => {
        return Math.floor(source[source.length - 1]);
    };
}

