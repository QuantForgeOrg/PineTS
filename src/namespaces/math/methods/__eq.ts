// SPDX-License-Identifier: AGPL-3.0-only

export function __eq(context: any) {
    return (a: number, b: number) => {
        const valA = Array.isArray(a) ? a[a.length - 1] : a;
        const valB = Array.isArray(b) ? b[b.length - 1] : b;
        return Math.abs(valA - valB) < 1e-8;
    };
}

