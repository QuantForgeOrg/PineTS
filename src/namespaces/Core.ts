// SPDX-License-Identifier: AGPL-3.0-only

export class Core {
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

    public color = {
        param: (source, index = 0) => {
            if (Array.isArray(source)) {
                return source[index];
            }
            return source;
        },
        rgb: (r: number, g: number, b: number, a?: number) => (a ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`),
        new: (color: string, a?: number) => {
            // Handle hexadecimal colors
            if (color && color.startsWith('#')) {
                // Remove # and convert to RGB
                const hex = color.slice(1);
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);

                return a ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
            }
            // Handle existing RGB format
            return a ? `rgba(${color}, ${a})` : color;
        },
        white: 'white',
        lime: 'lime',
        green: 'green',
        red: 'red',
        maroon: 'maroon',

        black: 'black',

        gray: 'gray',
        blue: 'blue',
    };
    constructor(private context: any) {}
    private extractPlotOptions(options: PlotCharOptions) {
        const _options: any = {};
        for (let key in options) {
            if (Array.isArray(options[key])) {
                _options[key] = options[key][0];
            } else {
                _options[key] = options[key];
            }
        }
        return _options;
    }
    indicator(title: string, shorttitle?: string, options?: IndicatorOptions) {
        //Just for compatibility, we don't need to do anything here
    }

    //in the current implementation, plot functions are only used to collect data for the plots array and map it to the market data
    plotchar(series: number[], title: string, options: PlotCharOptions) {
        if (!this.context.plots[title]) {
            this.context.plots[title] = { data: [], options: this.extractPlotOptions(options), title };
        }

        this.context.plots[title].data.push({
            time: this.context.data.openTime[this.context.idx],
            value: this.getCurrentValue(series),
            options: { ...this.extractPlotOptions(options), style: 'char' },
        });
    }

    plot(series: any, title: string, options: PlotOptions) {
        if (!this.context.plots[title]) {
            this.context.plots[title] = { data: [], options: this.extractPlotOptions(options), title };
        }

        this.context.plots[title].data.push({
            time: this.context.data.openTime[this.context.idx],
            value: this.getCurrentValue(series),
            options: this.extractPlotOptions(options),
        });
    }

    na(series: any) {
        const val = this.getCurrentValue(series);
        return isNaN(val);
    }
    nz(series: any, replacement: number = 0) {
        const val = this.getCurrentValue(series);
        const rep = this.getCurrentValue(replacement);
        return isNaN(val) ? rep : val;
    }
}
