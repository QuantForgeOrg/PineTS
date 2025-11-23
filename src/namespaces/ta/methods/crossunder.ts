// SPDX-License-Identifier: AGPL-3.0-only

export function crossunder(context: any) {
    return (source1: any, source2: any) => {
        // Get current values
        const current1 = Array.isArray(source1) ? source1[source1.length - 1] : source1;
        const current2 = Array.isArray(source2) ? source2[source2.length - 1] : source2;

        // Get previous values
        let prev1, prev2;

        if (Array.isArray(source1)) {
            prev1 = source1[source1.length - 2];
        } else {
            prev1 = undefined;
        }

        if (Array.isArray(source2)) {
            prev2 = source2[source2.length - 2];
        } else {
            prev2 = undefined;
        }

        // Check if source1 crossed below source2
        if (prev1 === undefined || prev2 === undefined || current1 === undefined || current2 === undefined) {
            return false;
        }

        return prev1 > prev2 && current1 < current2;
    };
}
