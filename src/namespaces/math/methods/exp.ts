// SPDX-License-Identifier: AGPL-3.0-only

export function exp(context: any) {
    return (source: number[]) => {
        return Math.exp(source[0]);
    };
}

