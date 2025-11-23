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
            context.params[name] = [source]; // Ensure it's a single element array
            return context.params[name];
        }
    };
}

