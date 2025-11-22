// SPDX-License-Identifier: AGPL-3.0-only

export function crossover(context: any) {
    return (source1: any, source2: any) => {
        // Get current values
        const current1 = Array.isArray(source1) ? source1[0] : source1;
        const current2 = Array.isArray(source2) ? source2[0] : source2;

        // Get previous values
        const prev1 = Array.isArray(source1) ? source1[1] : context.data.series[source1][1];
        const prev2 = Array.isArray(source2) ? source2[1] : context.data.series[source2][1];

        // Check if source1 crossed above source2
        return prev1 < prev2 && current1 > current2;
    };
}
