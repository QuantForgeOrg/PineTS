// SPDX-License-Identifier: AGPL-3.0-only

export function round(context: any) {
    return (source: number[]) => {
        return Math.round(source[0]);
    };
}

