// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (!context.params[name]) context.params[name] = [];
        if (Array.isArray(source)) {
            if (index) {
                context.params[name] = source.slice(index);
            } else {
                context.params[name] = source.slice(0);
            }
            return [source[index], name];
        } else {
            context.params[name][0] = source;
            return [source, name];
        }
    };
}

