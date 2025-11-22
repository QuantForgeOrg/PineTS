// SPDX-License-Identifier: AGPL-3.0-only

export function abs(context: any) {
    return (source: number[]) => {
        return Math.abs(source[0]);
    };
}

