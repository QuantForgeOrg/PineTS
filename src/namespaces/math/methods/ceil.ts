// SPDX-License-Identifier: AGPL-3.0-only

export function ceil(context: any) {
    return (source: number[]) => {
        return Math.ceil(source[source.length - 1]);
    };
}

