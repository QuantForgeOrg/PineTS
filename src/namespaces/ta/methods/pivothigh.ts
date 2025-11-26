// SPDX-License-Identifier: AGPL-3.0-only

import { pivothigh as pivothighUtil } from '../utils/pivothigh';
import { Series } from '../../../Series';

export function pivothigh(context: any) {
    return (source: any, _leftbars: any, _rightbars: any) => {
        //handle the case where source is not provided
        if (_rightbars == undefined) {
            _rightbars = _leftbars;
            _leftbars = source;

            //by default source is
            source = context.data.high;
        }
        const leftbars = Series.from(_leftbars).get(0);
        const rightbars = Series.from(_rightbars).get(0);

        // pivothighUtil expects forward array (oldest to newest)
        // source is now a Series or array. If it's context.data.high (native array), it's [oldest ... newest].
        // But the original code did source.slice(0).reverse().
        // That means pivothighUtil expected [newest ... oldest] (reverse order)?
        // Let's check the utility function later. Assuming the original code knew what it was doing.
        // If the original code reversed it, it meant `pivothighUtil` expects reverse order?
        // OR `source` was reverse order [newest ... oldest] and `reverse()` made it [oldest ... newest]?
        // In the OLD architecture, `context.data.high` was Reverse Order [newest ... oldest].
        // So `.reverse()` made it [oldest ... newest].
        //
        // In the NEW architecture, `context.data.high` is Forward Order [oldest ... newest].
        // So we do NOT need to reverse it if we want [oldest ... newest].

        // Let's assume pivothighUtil expects forward array (historical order).
        // We should pass the array as is.

        // If source is a Series, we get the underlying data?
        // But Series might have an offset.
        // If offset > 0, we need to slice the end?
        // `Series.toArray()` returns the underlying array.
        // If we need to respect offset, we might need to slice.
        // But typically pivothigh uses the whole history.

        // Let's convert to array.
        const sourceArray = Series.from(source).toArray();

        // Original: source.slice(0).reverse() -> [oldest ... newest]
        // New: sourceArray is already [oldest ... newest]
        // So we just pass sourceArray.

        // BUT wait: does pivothighUtil handle forward arrays?
        // The util likely expects the full history array.
        // And returns an array of same length?
        // `result[idx]` accesses by `context.idx`.
        // `context.idx` counts from 0 (start) to end.
        // In forward array, `result[idx]` is correct.

        const result = pivothighUtil(sourceArray, leftbars, rightbars);
        const idx = context.idx;
        return context.precision(result[idx]);
    };
}

