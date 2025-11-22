// SPDX-License-Identifier: AGPL-3.0-only

export function avg(context: any) {
    return (...sources: number[][]) => {
        const args = sources.map((e) => (Array.isArray(e) ? e[0] : e));

        return (
            args.reduce((a, b) => {
                const aVal = Array.isArray(a) ? a[0] : a;
                const bVal = Array.isArray(b) ? b[0] : b;
                return aVal + bVal;
            }, 0) / args.length
        );
    };
}

