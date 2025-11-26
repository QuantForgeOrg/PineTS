// SPDX-License-Identifier: AGPL-3.0-only

import { Series } from '../Series';

export class Core {
    public color = {
        param: (source, index = 0) => {
            return Series.from(source).get(index);
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
            _options[key] = Series.from(options[key]).get(0);
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

        const value = Series.from(series).get(0);

        this.context.plots[title].data.push({
            time: this.context.marketData[this.context.idx].openTime,
            value: value,
            options: { ...this.extractPlotOptions(options), style: 'char' },
        });
    }

    plot(series: any, title: string, options: PlotOptions) {
        if (!this.context.plots[title]) {
            this.context.plots[title] = { data: [], options: this.extractPlotOptions(options), title };
        }

        const value = Series.from(series).get(0);

        this.context.plots[title].data.push({
            time: this.context.marketData[this.context.idx].openTime,
            value: value,
            options: this.extractPlotOptions(options),
        });
    }

    na(series: any) {
        return isNaN(Series.from(series).get(0));
    }
    nz(series: any, replacement: number = 0) {
        const val = Series.from(series).get(0);
        const rep = Series.from(replacement).get(0);
        return isNaN(val) ? rep : val;
    }
}
