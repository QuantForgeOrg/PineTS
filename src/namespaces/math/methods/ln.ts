// SPDX-License-Identifier: AGPL-3.0-only

export function ln(context: any) {
    return (source: number[]) => {
        return Math.log(source[0]);
    };
}

