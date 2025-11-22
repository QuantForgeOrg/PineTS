// SPDX-License-Identifier: AGPL-3.0-only

export function tan(context: any) {
    return (source: number[]) => {
        return Math.tan(source[0]);
    };
}

