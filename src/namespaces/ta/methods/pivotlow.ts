// SPDX-License-Identifier: AGPL-3.0-only

import { pivotlow as pivotlowUtil } from '../utils/pivotlow';
import { Series } from '../../../Series';

export function pivotlow(context: any) {
    return (source: any, _leftbars: any, _rightbars: any) => {
        //handle the case where source is not provided
        if (_rightbars == undefined) {
            _rightbars = _leftbars;
            _leftbars = source;

            //by default source is
            source = context.data.low;
        }

        const leftbars = Series.from(_leftbars).get(0);
        const rightbars = Series.from(_rightbars).get(0);

        const sourceArray = Series.from(source).toArray();
        const result = pivotlowUtil(sourceArray, leftbars, rightbars);
        const idx = context.idx;
        return context.precision(result[idx]);
    };
}

