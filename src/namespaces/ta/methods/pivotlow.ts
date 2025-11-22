// SPDX-License-Identifier: AGPL-3.0-only

import { pivotlow as pivotlowUtil } from '../utils/pivotlow';

export function pivotlow(context: any) {
    return (source: any, _leftbars: any, _rightbars: any) => {
        //handle the case where source is not provided
        if (_rightbars == undefined) {
            _rightbars = _leftbars;
            _leftbars = source;

            //by default source is
            source = context.data.low;
        }

        const leftbars = Array.isArray(_leftbars) ? _leftbars[0] : _leftbars;
        const rightbars = Array.isArray(_rightbars) ? _rightbars[0] : _rightbars;

        const result = pivotlowUtil(source.slice(0).reverse(), leftbars, rightbars);
        const idx = context.idx;
        return context.precision(result[idx]);
    };
}

