import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';

import { Context } from 'Context.class';
import { Provider } from '@pinets/marketData/Provider.class';

describe('Indicators', () => {
    it('Squeeze Momentum Indicator [LazyBear]', async () => {
        const pineTS = new PineTS(Provider.Binance, 'SUIUSDT', '1d', 1000, 0, new Date('Dec 25 2024').getTime() - 1);

        const { result, plots } = await pineTS.run((context: Context) => {
            // This is a port of "Squeeze Momentum Indicator" indicator by LazyBear
            // List of all his indicators: https://www.tradingview.com/v/4IneGo8h/
            const { close, high, low } = context.data;

            const ta = context.ta;
            const math = context.math;

            const input = context.input;
            const { plot, plotchar, nz, color } = context.core;
            plotchar(close, 'close', { display: 'data_window' });

            const length = input.int(20, 'BB Length');
            const mult = input.float(2.0, 'BB MultFactor');
            const lengthKC = input.int(20, 'KC Length');
            const multKC = input.float(1.5, 'KC MultFactor');

            const useTrueRange = input.bool(true, 'Use TrueRange (KC)');

            // Calculate BB
            let source: any = close;
            const basis = ta.sma(source, length);
            const dev = multKC * ta.stdev(source, length);
            const upperBB = basis + dev;
            const lowerBB = basis - dev;

            // Calculate KC
            const ma = ta.sma(source, lengthKC);
            const range_1 = useTrueRange ? ta.tr : high - low;
            const rangema = ta.sma(range_1, lengthKC);
            const upperKC = ma + rangema * multKC;
            const lowerKC = ma - rangema * multKC;

            plotchar(lowerBB, 'lowerBB', { display: 'data_window' });
            plotchar(lowerKC, 'lowerKC', { display: 'data_window' });
            plotchar(upperBB, 'upperBB', { display: 'data_window' });
            plotchar(upperKC, 'upperKC', { display: 'data_window' });

            const sqzOn = lowerBB > lowerKC && upperBB < upperKC;
            const sqzOff = lowerBB < lowerKC && upperBB > upperKC;
            const noSqz = sqzOn == false && sqzOff == false;

            const val = ta.linreg(
                source - math.avg(math.avg(ta.highest(high, lengthKC), ta.lowest(low, lengthKC)), ta.sma(close, lengthKC)),
                lengthKC,
                0
            );

            const iff_1 = val > nz(val[1]) ? color.lime : color.green;
            const iff_2 = val < nz(val[1]) ? color.red : color.maroon;
            const bcolor = val > 0 ? iff_1 : iff_2;
            const scolor = noSqz ? color.blue : sqzOn ? color.black : color.gray;
            plot(val, 'val', { color: bcolor, style: 'histogram', linewidth: 4 });
            plot(0, 'char', { color: scolor, style: 'cross', linewidth: 2 });
        });

        const valPlot = plots['val'].data.reverse().slice(0, 40);
        const charPlot = plots['char'].data.reverse().slice(0, 40);

        const lowerBBPlot = plots['lowerBB'].data.reverse().slice(0, 10);
        const lowerKCPlot = plots['lowerKC'].data.reverse().slice(0, 10);
        const upperBBPlot = plots['upperBB'].data.reverse().slice(0, 10);
        const upperKCPlot = plots['upperKC'].data.reverse().slice(0, 10);

        valPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        charPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        lowerBBPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        lowerKCPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        upperBBPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        upperKCPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        console.log('>>> valPlot: ', valPlot);
        //console.log('>>> charPlot: ', charPlot);

        //console.log('>>> lowerBBPlot: ', lowerBBPlot);
        //console.log('>>> lowerKCPlot: ', lowerKCPlot);
        //console.log('>>> upperBBPlot: ', upperBBPlot);
        //console.log('>>> upperKCPlot: ', upperKCPlot);

        const expected = [
            {
                time: '2023-05-03T00:00:00.000Z',
                value: 0.3152073929,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-04T00:00:00.000Z',
                value: 0.3627874286,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-05T00:00:00.000Z',
                value: 0.3788036786,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-06T00:00:00.000Z',
                value: 0.4854128214,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-07T00:00:00.000Z',
                value: 0.5618345,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-08T00:00:00.000Z',
                value: 0.587261,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-09T00:00:00.000Z',
                value: 0.6980593571,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-10T00:00:00.000Z',
                value: 0.747549,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-11T00:00:00.000Z',
                value: 0.7286323929,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-12T00:00:00.000Z',
                value: 0.6933454643,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-13T00:00:00.000Z',
                value: 0.6242423214,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-14T00:00:00.000Z',
                value: 0.5779441071,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-15T00:00:00.000Z',
                value: 0.4549869643,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-16T00:00:00.000Z',
                value: 0.332166,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-17T00:00:00.000Z',
                value: 0.2215530357,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-18T00:00:00.000Z',
                value: 0.2450052857,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-19T00:00:00.000Z',
                value: 0.2313551786,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-20T00:00:00.000Z',
                value: 0.1475745,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-21T00:00:00.000Z',
                value: 0.0501255714,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-22T00:00:00.000Z',
                value: -0.0408131429,
                options: { color: 'maroon', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-23T00:00:00.000Z',
                value: -0.1273442857,
                options: { color: 'red', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-24T00:00:00.000Z',
                value: -0.1095786429,
                options: { color: 'red', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-25T00:00:00.000Z',
                value: -0.0883882143,
                options: { color: 'red', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-26T00:00:00.000Z',
                value: -0.0017241071,
                options: { color: 'red', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-27T00:00:00.000Z',
                value: 0.0708993214,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-28T00:00:00.000Z',
                value: 0.1702711786,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-29T00:00:00.000Z',
                value: 0.2858894643,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-30T00:00:00.000Z',
                value: 0.4186420357,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-05-31T00:00:00.000Z',
                value: 0.5448706786,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-01T00:00:00.000Z',
                value: 0.6551933214,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-02T00:00:00.000Z',
                value: 0.8310434643,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-03T00:00:00.000Z',
                value: 0.9664347143,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-04T00:00:00.000Z',
                value: 1.0714707143,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-05T00:00:00.000Z',
                value: 1.1414597143,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-06T00:00:00.000Z',
                value: 1.1757184286,
                options: { color: 'green', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-07T00:00:00.000Z',
                value: 1.21373925,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-08T00:00:00.000Z',
                value: 1.1849819286,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-09T00:00:00.000Z',
                value: 1.1416477143,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-10T00:00:00.000Z',
                value: 1.086249,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
            {
                time: '2023-06-11T00:00:00.000Z',
                value: 1.00178075,
                options: { color: 'lime', style: 'histogram', linewidth: 4 },
            },
        ];

        expect(valPlot).toEqual(expected);
    });
});
