// SPDX-License-Identifier: AGPL-3.0-only

export function log(context: any) {
    return (source: number[]) => {
        return Math.log(source[0]);
    };
}

