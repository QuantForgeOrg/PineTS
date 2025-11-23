import { describe, expect, it } from 'vitest';
import { arrayPrecision, getKlines, runNSFunctionWithArgs } from '../utils';

import { Context, PineTS, Provider } from 'index';

describe('BUG TESTS', () => {
    it('linreg-bug', async () => {
        const pineTS = new PineTS(Provider.Binance, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

        const sourceCode = (context: Context) => {
            const { low, open, close } = context.data;
            const ta = context.ta;
            const { plot, plotchar } = context.core;

            const source = close;
            const ta_sma = ta.sma(close, 9);
            const res = source - ta_sma;
            const data = ta.linreg(source - ta_sma, 14, 0); //<==== Not working
            //const data = ta.linreg(res, 14, 0); //<==== Working

            plotchar(data, 'data');
            const _low = low[0];
            const _open = open[0];
            return { data, _low, _open };
        };

        const { result, plots } = await pineTS.run(sourceCode);

        let plotdata = plots['data'].data;
        for (let i = 0; i < plotdata.length; i++) {
            plotdata[i].strtime = new Date(plotdata[i].time).toISOString().slice(0, -1) + '-00:00';
            plotdata[i]._low = result._low[i];
            plotdata[i]._open = result._open[i];
            delete plotdata[i].options;
        }
        //remove everything before 2025-10-29
        plotdata = plotdata.filter((e) => e.time >= new Date('2025-10-29').getTime());

        const plotdata_str = plotdata.map((e) => `${e.value}`).join('\n');

        const allValues = plotdata.map((e) => e.value);
        console.log('allValues', allValues);

        //expect all values to be different than NaN
        expect(allValues.every((e) => !isNaN(e))).toBe(true);
        expect(result.data.slice(-20).every((e) => !isNaN(e))).toBe(true);
    });
});
