import { describe, expect, it } from 'vitest';
import { getKlines, runNSFunctionWithArgs } from '../utils';
import { Context, PineTS } from 'index';
import { transpile } from 'transpiler';
import { Provider } from '@pinets/marketData/Provider.class';
import fs from 'fs';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('DCA Sniper', () => {
    it('Debug', async () => {
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'D', 100);

        const ctx0 = await pineTS.run(async (context) => {
            const ta = context.ta;
            const math = context.math;
            const { close, open, high, low } = context.data;
            const { plotchar, color, plot, na, nz } = context.core;

            const test2 = (value) => {
                return value;
            };
            const distanceSMA = () => {
                return test2(3);
            };
            const a = distanceSMA();

            const ph = ta.pivothigh(10, 10);
            const co = ta.crossover(close, open);
            plotchar(co, 'co');

            let lowest_signaled_price = nz(ta.lowest(close[1], 9), na);

            let low_price = na;
            let lowest = ta.lowest(low_price[1], 3);

            low_price = close;

            plot(lowest, 'lowest', { color: 'green' });
        });

        //console.log('>>> _cs_abs_body: ', ctx0.plots['lowest'].data.reverse().slice(0, 10));

        //console.log('>>> PH: ', ctx0.plots['ph'].data.reverse().slice(0, 30));

        const plotdata = ctx0.plots['co'].data.reverse().slice(0, 30);
        plotdata.forEach((e) => {
            e.time = new Date(e.time).toISOString();

            delete e.options;
        });
        console.log('>>> data: ', plotdata);

        const expected = [
            { time: '2025-08-15T00:00:00.000Z', value: false },
            { time: '2025-08-16T00:00:00.000Z', value: false },
            { time: '2025-08-17T00:00:00.000Z', value: false },
            { time: '2025-08-18T00:00:00.000Z', value: false },
            { time: '2025-08-19T00:00:00.000Z', value: true },
            { time: '2025-08-20T00:00:00.000Z', value: false },
            { time: '2025-08-21T00:00:00.000Z', value: false },
            { time: '2025-08-22T00:00:00.000Z', value: true },
            { time: '2025-08-23T00:00:00.000Z', value: false },
            { time: '2025-08-24T00:00:00.000Z', value: false },
            { time: '2025-08-25T00:00:00.000Z', value: false },
            { time: '2025-08-26T00:00:00.000Z', value: false },
            { time: '2025-08-27T00:00:00.000Z', value: false },
            { time: '2025-08-28T00:00:00.000Z', value: true },
            { time: '2025-08-29T00:00:00.000Z', value: false },
            { time: '2025-08-30T00:00:00.000Z', value: true },
            { time: '2025-08-31T00:00:00.000Z', value: false },
            { time: '2025-09-01T00:00:00.000Z', value: true },
            { time: '2025-09-02T00:00:00.000Z', value: false },
            { time: '2025-09-03T00:00:00.000Z', value: false },
            { time: '2025-09-04T00:00:00.000Z', value: false },
            { time: '2025-09-05T00:00:00.000Z', value: false },
            { time: '2025-09-06T00:00:00.000Z', value: true },
            { time: '2025-09-07T00:00:00.000Z', value: false },
            { time: '2025-09-08T00:00:00.000Z', value: false },
            { time: '2025-09-09T00:00:00.000Z', value: false },
            { time: '2025-09-10T00:00:00.000Z', value: false },
            { time: '2025-09-11T00:00:00.000Z', value: false },
            { time: '2025-09-12T00:00:00.000Z', value: false },
            { time: '2025-09-13T00:00:00.000Z', value: false },
        ];

        expect(plotdata).toEqual(expected);
    });
});
