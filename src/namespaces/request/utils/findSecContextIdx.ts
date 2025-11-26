// SPDX-License-Identifier: AGPL-3.0-only

export function findSecContextIdx(myOpenTime: number, myCloseTime: number, openTime: number[], closeTime: number[], lookahead: boolean = false): number {
    for (let i = 0; i < openTime.length; i++) {
        if (openTime[i] <= myOpenTime && myCloseTime <= closeTime[i]) {
            return i + (lookahead ? 1 : 2); //lookahead_on +1 lookahead_off +2
        }
    }
    return -1;
}

