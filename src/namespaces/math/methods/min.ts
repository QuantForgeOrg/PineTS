// SPDX-License-Identifier: AGPL-3.0-only

export function min(context: any) {
    return (...source: number[]) => {
        const arg = source.map((e) => (Array.isArray(e) ? e[e.length - 1] : e));
        return Math.min(...arg);
    };
}
