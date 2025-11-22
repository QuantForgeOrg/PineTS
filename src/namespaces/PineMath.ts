// SPDX-License-Identifier: AGPL-3.0-only
export class PineMath {
    private _cache = {};
    constructor(private context: any) {}

    param(source, index, name?: string) {
        if (!this.context.params[name]) this.context.params[name] = [];
        if (Array.isArray(source)) {
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
        return Math.abs(source[source.length - 1]);
    }
    pow(source: number[], power: number[]) {
        return Math.pow(source[source.length - 1], power[power.length - 1]);
    }
    sqrt(source: number[]) {
        return Math.sqrt(source[source.length - 1]);
    }
    log(source: number[]) {
        return Math.log(source[source.length - 1]);
    }
    ln(source: number[]) {
        return Math.log(source[source.length - 1]);
    }
    exp(source: number[]) {
        return Math.exp(source[source.length - 1]);
    }
    floor(source: number[]) {
        return Math.floor(source[source.length - 1]);
    }
    ceil(source: number[]) {
        return Math.ceil(source[source.length - 1]);
    }
    round(source: number[]) {
        return Math.round(source[source.length - 1]);
    }
    random() {
        return Math.random();
    }
    max(...source: number[]) {
        const arg = source.map((e) => (Array.isArray(e) ? e[e.length - 1] : e));
        return Math.max(...arg);
    }
    min(...source: number[]) {
        const arg = source.map((e) => (Array.isArray(e) ? e[e.length - 1] : e));
        return Math.min(...arg);
    }

    //sum of last n values
    sum(source: number[], length: number) {
        const len = Array.isArray(length) ? length[length.length - 1] : length;
        if (Array.isArray(source)) {
            // With forward arrays, take the last 'len' elements
            const startIdx = Math.max(0, source.length - len);
            return source.slice(startIdx).reduce((a, b) => a + b, 0);
        }
        return source;
    }

    sin(source: number[]) {
        return Math.sin(source[source.length - 1]);
    }
    cos(source: number[]) {
        return Math.cos(source[source.length - 1]);
    }
    tan(source: number[]) {
        return Math.tan(source[source.length - 1]);
    }

    acos(source: number[]) {
        return Math.acos(source[source.length - 1]);
    }
    asin(source: number[]) {
        return Math.asin(source[source.length - 1]);
    }
    atan(source: number[]) {
        return Math.atan(source[source.length - 1]);
    }

    avg(...sources: number[][]) {
        const args = sources.map((e) => (Array.isArray(e) ? e[e.length - 1] : e));

        return (
            args.reduce((a, b) => {
                const aVal = Array.isArray(a) ? a[a.length - 1] : a;
                const bVal = Array.isArray(b) ? b[b.length - 1] : b;
                return aVal + bVal;
            }, 0) / args.length
        );
    }
}

export default PineMath;
