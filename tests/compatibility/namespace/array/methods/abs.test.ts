import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { Provider } from '@pinets/marketData/Provider.class';
import { deserialize, deepEqual } from '../../../lib/serializer.js';

describe('ARRAY Namespace - ABS Method', () => {
    it('should calculate ABS correctly with native series and variable series', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

        const { result, plots } = await pineTS.run((context) => {
            const { close, open } = context.data;
                const array = context.array;
                const math = context.math;
                const { plot, plotchar } = context.core;
            
                const arr1 = array.new(3, -10);
                array.set(arr1, 1, -20);
                array.set(arr1, 2, -30);
                const arr2 = array.new(5, -20);
                array.set(arr2, 1, -20);
                array.set(arr2, 2, -30);
                array.set(arr2, 3, -40);
                array.set(arr2, 4, -50);
            
                const result1 = array.abs(arr1);
                const result2 = array.abs(arr2);
            
                const val1 = array.get(result1, 0);
                const val2 = array.get(result2, 0);
            
                plotchar(val1, '_plotchar');
                plot(val2, '_plot');
            
                const abs_native = array.get(result1, 2);
                const abs_var = array.get(result2, 3);
            
                return {
                    abs_native,
                    abs_var,
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
        const expectFilePath = path.join(__dirname, 'abs.expect.json');
        const expectedData = deserialize(fs.readFileSync(expectFilePath, 'utf-8'));

        // Assert results using custom deep equality (handles NaN correctly)
        expect(deepEqual(filtered_results, expectedData.results)).toBe(true);
        expect(plotchar_data_str.trim()).toEqual(expectedData.plotchar_data);
        expect(plot_data_str.trim()).toEqual(expectedData.plot_data);
    });
});
