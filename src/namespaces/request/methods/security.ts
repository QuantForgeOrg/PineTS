// SPDX-License-Identifier: AGPL-3.0-only

import { PineTS } from '../../../PineTS.class';
import { TIMEFRAMES } from '../utils/TIMEFRAMES';
import { findSecContextIdx } from '../utils/findSecContextIdx';

export function security(context: any) {
    return async (
        symbol: any,
        timeframe: any,
        expression: any,
        gaps: boolean = false,
        lookahead: boolean = false,
        ignore_invalid_symbol: boolean = false,
        currency: any = null,
        calc_bars_count: any = null
    ) => {
        const _symbol = symbol[0];
        const _timeframe = timeframe[0];
        const _expression = expression[0];
        const _expression_name = expression[1];

        const ctxTimeframeIdx = TIMEFRAMES.indexOf(context.timeframe);
        const reqTimeframeIdx = TIMEFRAMES.indexOf(_timeframe);

        if (ctxTimeframeIdx == -1 || reqTimeframeIdx == -1) {
            throw new Error('Invalid timeframe');
        }
        if (ctxTimeframeIdx > reqTimeframeIdx) {
            throw new Error('Only higher timeframes are supported for now');
        }

        if (ctxTimeframeIdx === reqTimeframeIdx) {
            return _expression;
        }

        const myOpenTime = context.data.openTime[context.data.openTime.length - 1];
        const myCloseTime = context.data.closeTime[context.data.closeTime.length - 1];

        if (context.cache[_expression_name]) {
            const secContext = context.cache[_expression_name];
            const secContextIdx = findSecContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, lookahead);
            return secContextIdx == -1 ? NaN : secContext.params[_expression_name][secContextIdx];
        }

        const pineTS = new PineTS(context.source, _symbol, _timeframe, context.limit || 1000, context.sDate, context.eDate);

        const secContext = await pineTS.run(context.pineTSCode);

        context.cache[_expression_name] = secContext;

        const secContextIdx = findSecContextIdx(myOpenTime, myCloseTime, secContext.data.openTime, secContext.data.closeTime, lookahead);
        return secContextIdx == -1 ? NaN : secContext.params[_expression_name][secContextIdx];
    };
}
