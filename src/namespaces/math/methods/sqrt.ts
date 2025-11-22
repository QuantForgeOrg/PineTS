// SPDX-License-Identifier: AGPL-3.0-only

export function sqrt(context: any) {
    return (source: number[]) => {
        return Math.sqrt(source[0]);
    };
}

