// SPDX-License-Identifier: AGPL-3.0-only

export function param(context: any) {
    return (source: any, index: any, name?: string) => {
        if (!context.params[name]) context.params[name] = [];
        if (Array.isArray(source)) {
            if (index) {
                // Forward array lookback
                context.params[name] = source.slice(0, source.length - index);
            } else {
                context.params[name] = source.slice(0);
            }
            // Return current value (adjusted for lookback)
            const val = source[source.length - 1 - (index || 0)];
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

