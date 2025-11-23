// SPDX-License-Identifier: AGPL-3.0-only

export function atan(context: any) {
    return (source: number[]) => {
        return Math.atan(source[source.length - 1]);
    };
}

