// SPDX-License-Identifier: AGPL-3.0-only

export function __eq(context: any) {
    return (a: number, b: number) => {
        return Math.abs(a - b) < 1e-8;
    };
}

