// SPDX-License-Identifier: AGPL-3.0-only

export function sin(context: any) {
    return (source: number[]) => {
        return Math.sin(source[0]);
    };
}

