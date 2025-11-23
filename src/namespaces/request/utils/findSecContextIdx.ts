// SPDX-License-Identifier: AGPL-3.0-only

export function findSecContextIdx(myOpenTime: number, myCloseTime: number, openTime: number[], closeTime: number[], lookahead: boolean = false): number {
    // Iterate backwards (from newest to oldest) as it's more likely to find match near the end
    for (let i = openTime.length - 1; i >= 0; i--) {
        if (openTime[i] <= myOpenTime && myCloseTime <= closeTime[i]) {
            // Forward array indices
            // Original logic: i + (lookahead ? 1 : 2) [Reverse Order]
            // i in Reverse was Newest=0. i+1 = Older.
            // i in Forward is Newest=Length-1. i-1 = Older.
            // So we assume +1 becomes -1, +2 becomes -2.
            return i - (lookahead ? 1 : 2); 
        }
    }
    return -1;
}

