// SPDX-License-Identifier: AGPL-3.0-only

export function avg(context: any) {
    return (...sources: number[][]) => {
        const args = sources.map((e) => (Array.isArray(e) ? e[e.length - 1] : e));

        return (
            args.reduce((a, b) => {
                const aVal = Array.isArray(a) ? a[a.length - 1] : a;
                const bVal = Array.isArray(b) ? b[b.length - 1] : b;
                return aVal + bVal;
            }, 0) / args.length
        );
    };
}
