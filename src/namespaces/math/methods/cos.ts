// SPDX-License-Identifier: AGPL-3.0-only

export function cos(context: any) {
    return (source: number[]) => {
        return Math.cos(source[source.length - 1]);
    };
}

