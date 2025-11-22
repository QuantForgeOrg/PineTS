// SPDX-License-Identifier: AGPL-3.0-only

export function acos(context: any) {
    return (source: number[]) => {
        return Math.acos(source[0]);
    };
}

