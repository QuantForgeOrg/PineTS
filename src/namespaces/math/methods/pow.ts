// SPDX-License-Identifier: AGPL-3.0-only

export function pow(context: any) {
    return (source: number[], power: number[]) => {
        return Math.pow(source[0], power[0]);
    };
}

