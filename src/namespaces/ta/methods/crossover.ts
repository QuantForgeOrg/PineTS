// SPDX-License-Identifier: AGPL-3.0-only

export function crossover(context: any) {
    return (source1: any, source2: any) => {
        // Get current values
        const current1 = Array.isArray(source1) ? source1[source1.length - 1] : source1;
        const current2 = Array.isArray(source2) ? source2[source2.length - 1] : source2;

        // Get previous values
        // Handle both array (series) and potential fallback/legacy cases
        let prev1, prev2;

        if (Array.isArray(source1)) {
            prev1 = source1[source1.length - 2];
        } else {
            // Fallback for scalars or mapped series
            // In original code: context.data.series[source1][1]
            // context.data.series might not be populated correctly in forward mode or we don't have key access
            // If source1 is scalar (number), it has no history, so prev is undefined (or same as current?)
            prev1 = undefined;
        }

        if (Array.isArray(source2)) {
            prev2 = source2[source2.length - 2];
        } else {
            prev2 = undefined;
        }

        // Check if source1 crossed above source2
        // Ensure values are valid numbers for comparison
        if (prev1 === undefined || prev2 === undefined || current1 === undefined || current2 === undefined) {
            return false;
        }

        return prev1 < prev2 && current1 > current2;
    };
}
