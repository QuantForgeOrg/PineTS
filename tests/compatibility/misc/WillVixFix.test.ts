import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { Provider } from '@pinets/marketData/Provider.class';
import { deserialize, deepEqual } from '../lib/serializer.js';

describe('UNKNOWN Namespace - WILLVIXFIX Method', () => {
    it('should calculate WILLVIXFIX correctly with native series and variable series', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

        const { result, plots } = await pineTS.run((context) => {
            // This is a PineTS port of "Squeeze Momentum Indicator" indicator by LazyBear
                // List of all his indicators: https://www.tradingview.com/v/4IneGo8h/
                const { close, high, low } = context.data;
            
                const ta = context.ta;
                const math = context.math;
            
                const input = context.input;
                const { plot, plotchar, nz, color } = context.core;
            
                const pd = input.int(22, 'LookBack Period Standard Deviation High');
                const bbl = input.int(20, 'Bolinger Band Length');
                const mult = input.float(2.0, 'Bollinger Band Standard Devaition Up');
                const lb = input.int(50, 'Look Back Period Percentile High');
                const ph = input.float(0.85, 'Highest Percentile - 0.90=90%, 0.95=95%, 0.99=99%');
                const pl = input.float(1.01, 'Lowest Percentile - 1.10=90%, 1.05=95%, 1.01=99%');
                const hp = input.bool(true, 'Show High Range - Based on Percentile and LookBack Period?');
                const sd = input.bool(true, 'Show Standard Deviation Line?');
            
                const wvf = ((ta.highest(close, pd) - low) / ta.highest(close, pd)) * 100;
            
                const sDev = mult * ta.stdev(wvf, bbl);
                const midLine = ta.sma(wvf, bbl);
                const lowerBand = midLine - sDev;
                const upperBand = midLine + sDev;
            
                const rangeHigh = ta.highest(wvf, lb) * ph;
                const rangeLow = ta.lowest(wvf, lb) * pl;
            
                const col = wvf >= upperBand || wvf >= rangeHigh ? color.lime : color.gray;
            
                const RangeHigh = hp && rangeHigh ? rangeHigh : NaN;
                const RangeLow = hp && rangeLow ? rangeLow : NaN;
                const UpperBand = sd && upperBand ? upperBand : NaN;
            
                plot(RangeHigh, 'RangeHigh', { style: 'line', linewidth: 1, color: 'lime' });
                plot(RangeLow, 'RangeLow', { style: 'line', linewidth: 1, color: 'orange' });
                plot(UpperBand, 'UpperBand', { style: 'line', linewidth: 2, color: 'aqua' });
                plot(wvf, 'WilliamsVixFix', { style: 'histogram', linewidth: 4, color: col });
            
                plotchar(UpperBand, '_plotchar');
                plot(wvf, '_plot');
            
                return {
                    RangeHigh,
                    RangeLow,
                    UpperBand,
                    wvf,
                    col,
                };
        });

        // Filter results for the date range 2025-10-01 to 2025-11-20
        const sDate = new Date('2025-10-01').getTime();
        const eDate = new Date('2025-11-20').getTime();

        const plotchar_data = plots['_plotchar'].data;
        const plot_data = plots['_plot'].data;

        // Extract results for the date range (same logic as expect-gen.ts)
        const filtered_results: any = {};
        let plotchar_data_str = '';
        let plot_data_str = '';

        if (plotchar_data.length != plot_data.length) {
            throw new Error('Plotchar and plot data lengths do not match');
        }

        for (let i = 0; i < plotchar_data.length; i++) {
            if (plotchar_data[i].time >= sDate && plotchar_data[i].time <= eDate) {
                plotchar_data_str += `[${plotchar_data[i].time}]: ${plotchar_data[i].value}\n`;
                plot_data_str += `[${plot_data[i].time}]: ${plot_data[i].value}\n`;
                for (let key in result) {
                    if (!filtered_results[key]) filtered_results[key] = [];
                    filtered_results[key].push(result[key][i]);
                }
            }
        }

        // Load expected data from JSON file using custom deserializer
        const expectFilePath = path.join(__dirname, 'WillVixFix.expect.json');
        const expectedData = deserialize(fs.readFileSync(expectFilePath, 'utf-8'));

        // Assert results using custom deep equality (handles NaN correctly)
        expect(deepEqual(filtered_results, expectedData.results)).toBe(true);
        expect(plotchar_data_str.trim()).toEqual(expectedData.plotchar_data);
        expect(plot_data_str.trim()).toEqual(expectedData.plot_data);
    });
});
