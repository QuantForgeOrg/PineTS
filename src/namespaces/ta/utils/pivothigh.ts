// SPDX-License-Identifier: AGPL-3.0-only

// Pivot high identifies a local high point
export function pivothigh(source: number[], leftbars: number, rightbars: number): number[] {
    const result = new Array(source.length).fill(NaN);

    // We need at least leftbars + rightbars + 1 (for the center point) values
    for (let i = leftbars + rightbars; i < source.length; i++) {
        const pivot = source[i - rightbars];
        let isPivot = true;

        // Check if the pivot is higher than all bars to the left within leftbars range
        for (let j = 1; j <= leftbars; j++) {
            if (source[i - rightbars - j] >= pivot) {
                isPivot = false;
                break;
            }
        }

        // Check if the pivot is higher than all bars to the right within rightbars range
        if (isPivot) {
            for (let j = 1; j <= rightbars; j++) {
                if (source[i - rightbars + j] >= pivot) {
                    isPivot = false;
                    break;
                }
            }
        }

        // If this is a pivot point, set its value, otherwise keep NaN
        if (isPivot) {
            result[i] = pivot;
        }
    }

    return result;
}

