// SPDX-License-Identifier: AGPL-3.0-only

type InputOptions =
    | {
          title?: string;
          group?: string;
      }
    | any;

//in the current implementation we just declare the input interfaces for compatibility
// in future versions this might be used for visualization
export class Input {
    constructor(private context: any) {}

    private getCurrentValue(source: any): number {
        if (Array.isArray(source)) {
            const isBuiltinSeries =
                source === this.context.data.close ||
                source === this.context.data.open ||
                source === this.context.data.high ||
                source === this.context.data.low ||
                source === this.context.data.volume ||
                source === this.context.data.hl2 ||
                source === this.context.data.hlc3 ||
                source === this.context.data.ohlc4 ||
                source === this.context.data.openTime ||
                source === this.context.data.closeTime;

            return isBuiltinSeries ? source[this.context.idx] : source[0];
        }
        return source;
    }

    param(source, index = 0) {
        if (Array.isArray(source)) {
            return [source[index]];
        }
        return [source];
    }

    any(value: any, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }

    int(value: number, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }

    float(value: number, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }

    bool(value: boolean, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }

    string(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    timeframe(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    time(value: number, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    price(value: number, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    session(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    source(value: any, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    symbol(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    text_area(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    enum(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
    color(value: string, { title, group }: InputOptions = {}) {
        return this.getCurrentValue(value);
    }
}

export default Input;
