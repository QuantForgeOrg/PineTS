// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2025 Alaa-eddine KADDOURI

import { IProvider, ISymbolInfo } from './marketData/IProvider';
import { PineArray } from './namespaces/array/array.index';
import { PineMap } from './namespaces/map/map.index';
import { PineMatrix } from './namespaces/matrix/matrix.index';
import { Barstate } from './namespaces/Barstate';
import { Core } from './namespaces/Core';
import { Input } from './namespaces/input/input.index';
import PineMath from './namespaces/math/math.index';
import { PineRequest } from './namespaces/request/request.index';
import TechnicalAnalysis from './namespaces/ta/ta.index';
import { Series } from './Series';
import { Log } from './namespaces/Log';
import { Str } from './namespaces/Str';
import types from './namespaces/Types';

export class Context {
    public data: any = {
        open: new Series([]),
        high: new Series([]),
        low: new Series([]),
        close: new Series([]),
        volume: new Series([]),
        hl2: new Series([]),
        hlc3: new Series([]),
        ohlc4: new Series([]),
    };
    public cache: any = {};
    public taState: any = {}; // State for incremental TA calculations
    public isSecondaryContext: boolean = false; // Flag to prevent infinite recursion in request.security

    public NA: any = NaN;

    public lang: any;

    // Combined namespace and core functions - the default way to access everything
    public pine: {
        input: Input;
        ta: TechnicalAnalysis;
        math: PineMath;
        request: PineRequest;
        array: PineArray;
        map: PineMap;
        matrix: PineMatrix;
        na: () => any;
        plotchar: (...args: any[]) => any;
        color: any;
        plot: (...args: any[]) => any;
        nz: (...args: any[]) => any;
        bar_index: number;
        syminfo: ISymbolInfo;
        barstate: Barstate;
        log: Log;
        str: Str;
        [key: string]: any;
    };

    // Track deprecation warnings to avoid spam
    private static _deprecationWarningsShown = new Set<string>();

    public idx: number = 0;

    public params: any = {};
    public const: any = {};
    public var: any = {};
    public let: any = {};

    public result: any = undefined;
    public plots: any = {};

    public marketData: any;
    public source: IProvider | any[];
    public tickerId: string;
    public timeframe: string = '';
    public limit: number;
    public sDate: number;
    public eDate: number;
    public fullContext: Context;

    public pineTSCode: Function | String;

    constructor({
        marketData,
        source,
        tickerId,
        timeframe,
        limit,
        sDate,
        eDate,
        fullContext,
    }: {
        marketData: any;
        source: IProvider | any[];
        tickerId?: string;
        timeframe?: string;
        limit?: number;
        sDate?: number;
        eDate?: number;
        fullContext?: Context;
    }) {
        this.marketData = marketData;
        this.source = source;
        this.tickerId = tickerId;
        this.timeframe = timeframe;
        this.limit = limit;
        this.sDate = sDate;
        this.eDate = eDate;
        this.fullContext = fullContext || this;
        // Initialize core functions
        const core = new Core(this);
        const coreFunctions = {
            plotchar: core.plotchar.bind(core),
            na: core.na.bind(core),
            color: core.color,
            plot: core.plot.bind(core),
            nz: core.nz.bind(core),
        };

        // Initialize everything directly in pine - the default way to access everything
        const _this = this;
        this.pine = {
            input: new Input(this),
            ta: new TechnicalAnalysis(this),
            math: new PineMath(this),
            request: new PineRequest(this),
            array: new PineArray(this),
            map: new PineMap(this),
            matrix: new PineMatrix(this),
            na: coreFunctions.na,
            plotchar: coreFunctions.plotchar,
            color: coreFunctions.color,
            plot: coreFunctions.plot,
            nz: coreFunctions.nz,
            syminfo: null,

            //FIXME : this is a temporary solution to get the barstate values,
            //we need to implement a better way to handle realtime states
            barstate: new Barstate(this),
            get bar_index() {
                return _this.idx;
            },
            get last_bar_index() {
                return _this.data.close.length - 1;
            },
            get last_bar_time() {
                return _this.data.openTime.get(_this.data.openTime.length - 1);
            },
            get timenow() {
                return new Date().getTime();
            },
            log: new Log(this),
            str: new Str(this),
            ...types,
        };
    }

    //#region [Runtime functions] ===========================

    /**
     * this function is used to initialize the target variable with the source array
     * this array will represent a time series and its values will be shifted at runtime in order to mimic Pine script behavior
     * @param trg - the target variable name : used internally to maintain the series in the execution context
     * @param src - the source data, can be Series, array, or a single value
     * @param idx - the index of the source array, used to get a sub-series of the source data
     * @returns Series object
     */
    init(trg, src: any, idx: number = 0): Series {
        // Extract value from source
        let value;
        if (src instanceof Series) {
            value = src.get(0);
        } else if (Array.isArray(src)) {
            // Handle 2D arrays (tuples wrapped by $.precision() or from request.security)
            // e.g., [[a, b]] from return $.precision([[a, b]]) or request.security tuple
            if (Array.isArray(src[0])) {
                value = src[0];
            } else {
                // Flat 1D array = time-series data (forward-ordered)
                // Extract the element at the right position
                value = src[src.length - 1 + idx];
            }
        } else {
            value = src;
        }

        // If target doesn't exist, create new Series
        if (!trg) {
            return new Series([value]);
        }

        // If target is already a Series, update it
        if (trg instanceof Series) {
            trg.data[trg.data.length - 1] = value;
            return trg;
        }

        // Legacy: if trg is an array, convert to Series
        if (Array.isArray(trg)) {
            trg[trg.length - 1] = value;
            return new Series(trg);
        }

        // Default: create new Series
        return new Series([value]);
    }

    /**
     * Initializes a 'var' variable.
     * - First bar: uses the initial value.
     * - Subsequent bars: maintains the previous value (state).
     * @param trg - The target variable
     * @param src - The source initializer value
     * @returns Series object
     */
    initVar(trg, src: any): Series {
        // If target exists (subsequent bars), return it as is.
        // PineTS automatically shifts context variables by copying the last value,
        // so the previous value is already carried over to the current slot.
        if (trg) {
            return trg;
        }

        // First bar: Initialize with source value
        let value;
        if (src instanceof Series) {
            value = src.get(0);
        } else if (Array.isArray(src)) {
            if (Array.isArray(src[0])) {
                value = src[0];
            } else {
                value = this.precision(src[src.length - 1]);
            }
        } else {
            value = this.precision(src);
        }

        return new Series([value]);
    }

    /**
     * this function is used to set the floating point precision of a number
     * by default it is set to 10 decimals which is the same as pine script
     * @param n - the number to be precision
     * @param decimals - the number of decimals to precision to
     * @returns the precision number
     */
    precision(value: number, decimals: number = 10) {
        const epsilon = 10 ** decimals;
        return typeof value === 'number' ? Math.round(value * epsilon) / epsilon : value;
        //if (typeof n !== 'number' || isNaN(n)) return n;
        //return Number(n.toFixed(decimals));
    }

    /**
     * This function is used to apply special transformation to internal PineTS parameters and handle them as time-series
     * @param source - the source data, can be an array or a single value
     * @param index - the index of the source array, used to get a sub-series of the source data
     * @param name - the name of the parameter, used as a unique identifier in the current execution context, this allows us to properly handle the param as a series
     * @returns the current value of the param
     */
    param(source, index, name?: string) {
        if (typeof source === 'string') return source;
        if (source instanceof Series) {
            if (index) {
                return new Series(source.data, source.offset + index);
            }
            return source;
        }

        if (!Array.isArray(source) && typeof source === 'object') return source;

        if (!this.params[name]) this.params[name] = [];
        if (Array.isArray(source)) {
            return new Series(source, index || 0);
        } else {
            if (this.params[name].length === 0) {
                this.params[name].push(source);
            } else {
                this.params[name][this.params[name].length - 1] = source;
            }
            return new Series(this.params[name], 0);
        }
    }

    /**
     * Access a series value with Pine Script semantics (reverse order)
     * @param source - The source series or array
     * @param index - The lookback index (0 = current value)
     */
    get(source: any, index: number) {
        if (source instanceof Series) {
            return source.get(index);
        }

        if (Array.isArray(source)) {
            // Optimized forward array access:
            // index 0 -> last element (length - 1)
            // index 1 -> second last element (length - 2)
            const realIndex = source.length - 1 - index;
            if (realIndex < 0 || realIndex >= source.length) {
                return NaN;
            }
            return source[realIndex];
        }

        // Scalar value - return as is, ignoring index
        return source;
    }

    /**
     * Set the current value of a series (index 0)
     * @param target - The target series or array
     * @param value - The value to set
     */
    set(target: any, value: any) {
        if (target instanceof Series) {
            target.set(0, value);
            return;
        }

        if (Array.isArray(target)) {
            if (target.length > 0) {
                target[target.length - 1] = value;
            } else {
                target.push(value);
            }
            return;
        }
    }

    //#region [Deprecated getters] ===========================

    /**
     * @deprecated Use context.pine.math instead. This will be removed in a future version.
     */
    get math(): PineMath {
        this._showDeprecationWarning('const math = context.math', 'const { math, ta, input } = context.pine');
        return this.pine.math;
    }

    /**
     * @deprecated Use context.pine.ta instead. This will be removed in a future version.
     */
    get ta(): TechnicalAnalysis {
        this._showDeprecationWarning('const ta = context.ta', 'const { ta, math, input } = context.pine');
        return this.pine.ta;
    }

    /**
     * @deprecated Use context.pine.input instead. This will be removed in a future version.
     */
    get input(): Input {
        this._showDeprecationWarning('const input = context.input', 'const { input, math, ta } = context.pine');
        return this.pine.input;
    }

    /**
     * @deprecated Use context.pine.request instead. This will be removed in a future version.
     */
    get request(): PineRequest {
        this._showDeprecationWarning('const request = context.request', 'const { request, math, ta } = context.pine');
        return this.pine.request;
    }

    /**
     * @deprecated Use context.pine.array instead. This will be removed in a future version.
     */
    get array(): PineArray {
        this._showDeprecationWarning('const array = context.array', 'const { array, math, ta } = context.pine');
        return this.pine.array;
    }

    /**
     * @deprecated Use context.pine.* (e.g., context.pine.na, context.pine.plot) instead. This will be removed in a future version.
     */
    get core(): any {
        this._showDeprecationWarning('context.core.*', 'context.pine (e.g., const { na, plotchar, color, plot, nz } = context.pine)');
        return {
            na: this.pine.na,
            plotchar: this.pine.plotchar,
            color: this.pine.color,
            plot: this.pine.plot,
            nz: this.pine.nz,
        };
    }

    /**
     * Shows a deprecation warning once per property access pattern
     */
    private _showDeprecationWarning(oldUsage: string, newUsage: string): void {
        const warningKey = `${oldUsage}->${newUsage}`;
        if (!Context._deprecationWarningsShown.has(warningKey)) {
            Context._deprecationWarningsShown.add(warningKey);

            // Try CSS styling for browsers, fallback to ANSI codes for Node.js
            if (typeof window !== 'undefined') {
                // Browser environment - use CSS styling
                console.warn(
                    '%c[WARNING]%c %s syntax is deprecated. Use %s instead. This will be removed in a future version.',
                    'color: #FFA500; font-weight: bold;',
                    'color: #FFA500;',
                    oldUsage,
                    newUsage
                );
            } else {
                // Node.js environment - use ANSI color codes
                console.warn(
                    `\x1b[33m[WARNING] ${oldUsage} syntax is deprecated. Use ${newUsage} instead. This will be removed in a future version.\x1b[0m`
                );
            }
        }
    }

    //#endregion
}
export default Context;
