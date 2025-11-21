// SPDX-License-Identifier: AGPL-3.0-only
export class PineMath {
    private _cache = {};
    constructor(private context: any) {}

    /**
     * Helper method to get the current value from a source array
     * Handles both forward-indexed (built-in series) and backward-indexed (user variables) arrays
     */
    private getCurrentValue(source: any): number {
        if (Array.isArray(source)) {
            // For forward-indexed arrays (built-in series), use context.idx
            // For backward-indexed arrays (user variables), use [0]
            const isBuiltinSeries =
                source === this.context.data.close ||
                source === this.context.data.open ||
                source === this.context.data.high ||
                source === this.context.data.low ||
                source === this.context.data.volume ||
                source === this.context.data.hl2 ||
                source === this.context.data.hlc3 ||
                source === this.context.data.ohlc4;

            return isBuiltinSeries ? source[this.context.idx] : source[0];
        }
        return source;
    }

    param(source, index, name?: string) {
        if (!this.context.params[name]) this.context.params[name] = [];
        if (Array.isArray(source)) {
            // Check if this is a built-in series (forward-indexed)
            const isBuiltinSeries =
                source === this.context.data.close ||
                source === this.context.data.open ||
                source === this.context.data.high ||
                source === this.context.data.low ||
                source === this.context.data.volume ||
                source === this.context.data.hl2 ||
                source === this.context.data.hlc3 ||
                source === this.context.data.ohlc4;

            if (isBuiltinSeries) {
                // For built-in series, return the array directly without slicing
                return source;
            }

            // For user variables (backward-indexed), use the old behavior
            if (index) {
                this.context.params[name] = source.slice(index);
                this.context.params[name].length = source.length; //ensure length is correct
                return this.context.params[name];
            }
            this.context.params[name] = source.slice(0);
            return this.context.params[name];
        } else {
            this.context.params[name][0] = source;
            return this.context.params[name];
        }
        //return [source];
    }
    __eq(a: number, b: number) {
        return Math.abs(a - b) < 1e-8;
    }

    abs(source: number[]) {
        return Math.abs(this.getCurrentValue(source));
    }
    pow(source: number[], power: number[]) {
        return Math.pow(this.getCurrentValue(source), this.getCurrentValue(power));
    }
    sqrt(source: number[]) {
        return Math.sqrt(this.getCurrentValue(source));
    }
    log(source: number[]) {
        return Math.log(this.getCurrentValue(source));
    }
    ln(source: number[]) {
        return Math.log(this.getCurrentValue(source));
    }
    exp(source: number[]) {
        return Math.exp(this.getCurrentValue(source));
    }
    floor(source: number[]) {
        return Math.floor(this.getCurrentValue(source));
    }
    ceil(source: number[]) {
        return Math.ceil(this.getCurrentValue(source));
    }
    round(source: number[]) {
        return Math.round(this.getCurrentValue(source));
    }
    random() {
        return Math.random();
    }
    max(...source: number[]) {
        const arg = source.map((e) => (Array.isArray(e) ? this.getCurrentValue(e) : e));
        return Math.max(...arg);
    }
    min(...source: number[]) {
        const arg = source.map((e) => (Array.isArray(e) ? this.getCurrentValue(e) : e));
        return Math.min(...arg);
    }

    //sum of last n values
    sum(source: number[], length: number) {
        const len = Array.isArray(length) ? length[0] : length;
        if (Array.isArray(source)) {
            return source.slice(0, len).reduce((a, b) => a + b, 0);
        }
        return source;
    }

    sin(source: number[]) {
        return Math.sin(this.getCurrentValue(source));
    }
    cos(source: number[]) {
        return Math.cos(this.getCurrentValue(source));
    }
    tan(source: number[]) {
        return Math.tan(this.getCurrentValue(source));
    }

    acos(source: number[]) {
        return Math.acos(this.getCurrentValue(source));
    }
    asin(source: number[]) {
        return Math.asin(this.getCurrentValue(source));
    }
    atan(source: number[]) {
        return Math.atan(this.getCurrentValue(source));
    }

    avg(...sources: number[][]) {
        const args = sources.map((e) => (Array.isArray(e) ? this.getCurrentValue(e) : e));

        return (
            args.reduce((a, b) => {
                const aVal = Array.isArray(a) ? a : a;
                const bVal = Array.isArray(b) ? b : b;
                return aVal + bVal;
            }, 0) / args.length
        );
    }
}

export default PineMath;
