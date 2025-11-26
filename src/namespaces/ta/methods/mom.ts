// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function mom(context: any) {
    return (source: any, _length: any, _callId?: string) => {
        const length = Series.from(_length).get(0);

        // Momentum is same as change
        return context.ta.change(source, length);
    };
}

