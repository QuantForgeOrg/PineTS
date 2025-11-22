import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';

import { Context } from 'Context.class';
import { Provider } from '@pinets/marketData/Provider.class';

describe('Indicators', () => {
    it('Squeeze Momentum Indicator [LazyBear]', async () => {
        //const pineTS = new PineTS(Provider.Binance, 'SUIUSDT', '1d', 1000, 0, new Date('Dec 25 2024').getTime() - 1);
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'D', null, new Date('2025-01-29').getTime(), new Date('2025-11-20').getTime());

        const { result, plots } = await pineTS.run((context: Context) => {
            // This is a port of "Squeeze Momentum Indicator" indicator by LazyBear
            // List of all his indicators: https://www.tradingview.com/v/4IneGo8h/
            const { close, high, low } = context.data;

            const ta = context.ta;
            const math = context.math;

            const input = context.input;
            const { plot, plotchar, nz, color } = context.core;

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

            // console.log('>>> lowerBB: ', lowerBB);
            // console.log('>>> lowerKC: ', lowerKC);
            // console.log('>>> upperBB: ', upperBB);
            // console.log('>>> upperKC: ', upperKC);

            const sqzOn = lowerBB > lowerKC && upperBB < upperKC;
            const sqzOff = lowerBB < lowerKC && upperBB > upperKC;
            const noSqz = sqzOn == false && sqzOff == false;

            const ta_lowest = ta.lowest(low, lengthKC);
            const ta_highest = ta.highest(high, lengthKC);
            const ta_sma = ta.sma(close, lengthKC);
            const ta_avg = math.avg(math.avg(ta_highest, ta_lowest), ta_sma);
            const val = source - ta_avg;

            plotchar(ta_lowest, 'ta_lowest');
            //console.log('>>> ', ta_lowest + ' | ' + ta_highest + ' | ' + ta_sma + ' | ' + ta_avg + ' | ' + val);

            //console.log('>>> val: ', source, ta_avg, val);

            // const val = ta.linreg(
            //     source - math.avg(math.avg(ta.highest(high, lengthKC), ta.lowest(low, lengthKC)), ta.sma(close, lengthKC)),
            //     lengthKC,
            //     0
            // );
            //console.log('>>> val: ', source);

            const iff_1 = val > nz(val[1]) ? color.lime : color.green;
            const iff_2 = val < nz(val[1]) ? color.red : color.maroon;
            //const bcolor = val > 0 ? iff_1 : iff_2;
            //const scolor = noSqz ? color.blue : sqzOn ? color.black : color.gray;
            //plot(val, 'val', { color: bcolor, style: 'histogram', linewidth: 4 });
            //plot(0, 'char', { color: scolor, style: 'cross', linewidth: 2 });

            plotchar(val, 'val');
        });

        // const valPlot = plots['val'].data.reverse().slice(0, 40);
        // const charPlot = plots['char'].data.reverse().slice(0, 40);

        // const lowerBBPlot = plots['lowerBB'].data.reverse().slice(0, 10);
        // const lowerKCPlot = plots['lowerKC'].data.reverse().slice(0, 10);
        // const upperBBPlot = plots['upperBB'].data.reverse().slice(0, 10);
        // const upperKCPlot = plots['upperKC'].data.reverse().slice(0, 10);

        // valPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // charPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // lowerBBPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // lowerKCPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // upperBBPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // upperKCPlot.forEach((e) => (e.time = new Date(e.time).toISOString()));
        // console.log('>>> valPlot: ', valPlot);
        //console.log('>>> charPlot: ', charPlot);

        //console.log('>>> lowerBBPlot: ', lowerBBPlot);
        //console.log('>>> lowerKCPlot: ', lowerKCPlot);
        //console.log('>>> upperBBPlot: ', upperBBPlot);
        //console.log('>>> upperKCPlot: ', upperKCPlot);

        const plotdata = plots['val']?.data
            //filter everything before 2025-10-29
            .filter((e) => e.time >= new Date('2025-10-29').getTime());

        plotdata.forEach((e) => {
            e.time = new Date(e.time).toISOString().slice(0, -1) + '-00:00';

            delete e.options;
        });
        const plotdata_str = plotdata.map((e) => `[${e.time}]: ${e.value}`).join('\n');

        const expected_val = `[2025-10-29T00:00:00.000-00:00]: -1944.45975
[2025-10-30T00:00:00.000-00:00]: -1577.0484642857
[2025-10-31T00:00:00.000-00:00]: -1173.8730714286
[2025-11-01T00:00:00.000-00:00]: -285.8722857143
[2025-11-02T00:00:00.000-00:00]: 713.57175
[2025-11-03T00:00:00.000-00:00]: 784.3590357143
[2025-11-04T00:00:00.000-00:00]: -55.3651428571
[2025-11-05T00:00:00.000-00:00]: -649.9203928571
[2025-11-06T00:00:00.000-00:00]: -1900.5967857143
[2025-11-07T00:00:00.000-00:00]: -2703.9135357143
[2025-11-08T00:00:00.000-00:00]: -3552.5550357143
[2025-11-09T00:00:00.000-00:00]: -3740.4058571429
[2025-11-10T00:00:00.000-00:00]: -3895.3378214286
[2025-11-11T00:00:00.000-00:00]: -4685.1503571429
[2025-11-12T00:00:00.000-00:00]: -5449.9385357143
[2025-11-13T00:00:00.000-00:00]: -6333.8031428572
[2025-11-14T00:00:00.000-00:00]: -7744.5145714286
[2025-11-15T00:00:00.000-00:00]: -8405.1748571429
[2025-11-16T00:00:00.000-00:00]: -9006.8344642857
[2025-11-17T00:00:00.000-00:00]: -9622.7851071429
[2025-11-18T00:00:00.000-00:00]: -9900.2597857143
[2025-11-19T00:00:00.000-00:00]: -10253.8493571429
[2025-11-20T00:00:00.000-00:00]: -11067.68075`;

        //expect(valPlot).toEqual(expected);
        expect(plotdata_str.trim()).toEqual(expected_val.trim());
    });
});
