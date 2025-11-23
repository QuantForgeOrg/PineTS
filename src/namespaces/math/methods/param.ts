// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (typeof source === 'string') return source;
        if (!Array.isArray(source) && typeof source === 'object') return source;

        if (!context.params[name]) context.params[name] = [];
        if (Array.isArray(source)) {
            if (index) {
                context.params[name] = source.slice(0, source.length - index);
                return context.params[name];
            }
            context.params[name] = source.slice(0);
            return context.params[name];
        } else {
            if (context.params[name].length === 0) {
                context.params[name].push(source);
            } else {
                context.params[name][context.params[name].length - 1] = source;
            }
            return context.params[name];
        }
    };
}

