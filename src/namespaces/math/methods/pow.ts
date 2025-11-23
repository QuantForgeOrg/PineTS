// SPDX-License-Identifier: AGPL-3.0-only

export function pow(context: any) {
    return (source: number[], power: number[]) => {
        const val = Array.isArray(source) ? source[source.length - 1] : source;
        const pow = Array.isArray(power) ? power[power.length - 1] : power;
        return Math.pow(val, pow);
    };
}

