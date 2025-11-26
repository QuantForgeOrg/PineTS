// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../../../Series';

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (!context.params[name]) context.params[name] = [];

        if (source instanceof Series || Array.isArray(source)) {
            const val = Series.from(source).get(index || 0);
            return [val, name];
        } else {
            if (context.params[name].length === 0) {
                context.params[name].push(source);
            } else {
                context.params[name][context.params[name].length - 1] = source;
            }
            return [source, name];
        }
    };
}

