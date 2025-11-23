// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (!context.params[name]) context.params[name] = [];
        if (Array.isArray(source)) {
            if (index) {
                context.params[name] = source.slice(0, source.length - index);
                return context.params[name];
            }
            context.params[name] = source.slice(0);
            return context.params[name];
        } else {
            context.params[name][0] = source;
            return context.params[name];
        }
    };
}
