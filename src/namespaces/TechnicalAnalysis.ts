// SPDX-License-Identifier: AGPL-3.0-only
export class TechnicalAnalysis {
    constructor(private context: any) {}

    /**
     * Helper method to get the current value from a source array
     * Handles both forward-indexed (built-in series) and backward-indexed (user variables) arrays
     */
    private getCurrentValue(source: any): number {
        if (Array.isArray(source)) {
            // For forward-indexed arrays (built-in series), use context.idx
            // For backward-indexed arrays (user variables), use [0]
            // We detect built-in series by checking if source is one of context.data arrays
            const isBuiltinSeries =
                source === this.context.data.close ||
                source === this.context.data.open ||
                source === this.context.data.high ||
                source === this.context.data.low ||
                source === this.context.data.volume ||
                source === this.context.data.hl2 ||
                source === this.context.data.hlc3 ||
                source === this.context.data.ohlc4;

            return isBuiltinSeries ? source[this.context.idx] : source[0];
        }
        return source;
    }

    public get tr() {
        const idx = this.context.idx;
        const val = this.context.math.max(
            this.context.data.high[idx] - this.context.data.low[idx],
            this.context.math.abs(this.context.data.high[idx] - this.context.data.close[idx - 1]),
            this.context.math.abs(this.context.data.low[idx] - this.context.data.close[idx - 1])
        );
        return val;
    }

    param(source, index, name?: string) {
        if (!this.context.params[name]) this.context.params[name] = [];
        if (Array.isArray(source)) {
            // Check if this is a built-in series (forward-indexed)
            const isBuiltinSeries =
                source === this.context.data.close ||
                source === this.context.data.open ||
                source === this.context.data.high ||
                source === this.context.data.low ||
                source === this.context.data.volume ||
                source === this.context.data.hl2 ||
                source === this.context.data.hlc3 ||
                source === this.context.data.ohlc4;

            if (isBuiltinSeries) {
                // For built-in series, return the array directly without slicing
                // The TA functions will use getCurrentValue() to access the right index
                return source;
            }

            // For user variables (backward-indexed), use the old behavior
            if (index) {
                this.context.params[name] = source.slice(index);
                this.context.params[name].length = source.length; //ensure length is correct
                return this.context.params[name];
            }
            this.context.params[name] = source.slice(0);
            return this.context.params[name];
        } else {
            this.context.params[name][0] = source;
            return this.context.params[name];
        }
        //return [source];
    }

    ema(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental EMA calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `ema_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { prevEma: null, initSum: 0, initCount: 0 };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        if (state.initCount < period) {
            // Accumulate for SMA initialization
            state.initSum += currentValue;
            state.initCount++;

            if (state.initCount === period) {
                state.prevEma = state.initSum / period;
                return this.context.precision(state.prevEma);
            }
            return NaN;
        }

        // Calculate EMA incrementally: EMA = alpha * current + (1 - alpha) * prevEMA
        const alpha = 2 / (period + 1);
        const ema = currentValue * alpha + state.prevEma * (1 - alpha);
        state.prevEma = ema;

        return this.context.precision(ema);
    }

    sma(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental SMA calculation using rolling sum
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `sma_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source) || 0;

        // Add current value to window
        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < period) {
            // Not enough data yet
            return NaN;
        }

        if (state.window.length > period) {
            // Remove oldest value from sum
            const oldValue = state.window.pop();
            state.sum -= oldValue;
        }

        const sma = state.sum / period;
        return this.context.precision(sma);
    }

    vwma(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Volume-Weighted Moving Average
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `vwma_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [], volumeWindow: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);
        const currentVolume = this.context.data.volume[this.context.idx];

        state.window.unshift(currentValue);
        state.volumeWindow.unshift(currentVolume);

        if (state.window.length < period) {
            return NaN;
        }

        if (state.window.length > period) {
            state.window.pop();
            state.volumeWindow.pop();
        }

        let sumVolPrice = 0;
        let sumVol = 0;
        for (let i = 0; i < period; i++) {
            sumVolPrice += state.window[i] * state.volumeWindow[i];
            sumVol += state.volumeWindow[i];
        }

        const vwma = sumVolPrice / sumVol;
        return this.context.precision(vwma);
    }

    wma(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Weighted Moving Average
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `wma_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < period) {
            return NaN;
        }

        if (state.window.length > period) {
            state.window.pop();
        }

        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < period; i++) {
            const weight = period - i;
            numerator += state.window[i] * weight;
            denominator += weight;
        }

        const wma = numerator / denominator;
        return this.context.precision(wma);
    }

    hma(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Hull Moving Average: HMA = WMA(2*WMA(n/2) - WMA(n), sqrt(n))
        const halfPeriod = Math.floor(period / 2);
        const sqrtPeriod = Math.floor(Math.sqrt(period));

        // Pass derived call IDs to internal WMA calls to avoid state collision
        const wma1 = this.wma(source, halfPeriod, _callId ? `${_callId}_wma1` : undefined);
        const wma2 = this.wma(source, period, _callId ? `${_callId}_wma2` : undefined);

        if (isNaN(wma1) || isNaN(wma2)) {
            return NaN;
        }

        // Create synthetic source for final WMA: 2*wma1 - wma2
        // We need to feed this into WMA calculation
        // Store the raw value in a temporary series
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `hma_raw_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = [];
        }

        const rawHma = 2 * wma1 - wma2;
        this.context.taState[stateKey].unshift(rawHma);

        // Apply WMA to the raw HMA values
        const hmaStateKey = _callId ? `${_callId}_hma_final` : `hma_final_${period}`;
        if (!this.context.taState[hmaStateKey]) {
            this.context.taState[hmaStateKey] = { window: [] };
        }

        const state = this.context.taState[hmaStateKey];
        state.window.unshift(rawHma);

        if (state.window.length < sqrtPeriod) {
            return NaN;
        }

        if (state.window.length > sqrtPeriod) {
            state.window.pop();
        }

        let numerator = 0;
        let denominator = 0;
        for (let i = 0; i < sqrtPeriod; i++) {
            const weight = sqrtPeriod - i;
            numerator += state.window[i] * weight;
            denominator += weight;
        }

        const hma = numerator / denominator;
        return this.context.precision(hma);
    }

    rma(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental RMA calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `rma_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { prevRma: null, initSum: 0, initCount: 0 };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source) || 0;

        if (state.initCount < period) {
            // Accumulate for SMA initialization
            state.initSum += currentValue;
            state.initCount++;

            if (state.initCount === period) {
                state.prevRma = state.initSum / period;
                return this.context.precision(state.prevRma);
            }
            return NaN;
        }

        // Calculate RMA incrementally: RMA = alpha * current + (1 - alpha) * prevRMA
        const alpha = 1 / period;
        const rma = currentValue * alpha + state.prevRma * (1 - alpha);
        state.prevRma = rma;

        return this.context.precision(rma);
    }

    change(source, _length = 1, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Simple lookback - store window
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `change_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length <= length) {
            return NaN;
        }

        if (state.window.length > length + 1) {
            state.window.pop();
        }

        const change = currentValue - state.window[length];
        return this.context.precision(change);
    }

    rsi(source, _period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental RSI calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `rsi_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = {
                prevValue: null,
                avgGain: 0,
                avgLoss: 0,
                initGains: [],
                initLosses: [],
            };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        // Calculate gain/loss from previous value
        if (state.prevValue !== null) {
            const diff = currentValue - state.prevValue;
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            // Accumulate gains/losses until we have 'period' values
            if (state.initGains.length < period) {
                state.initGains.push(gain);
                state.initLosses.push(loss);

                // Once we have 'period' gain/loss pairs, calculate first RSI
                if (state.initGains.length === period) {
                    // Calculate first RSI using simple averages
                    state.avgGain = state.initGains.reduce((a, b) => a + b, 0) / period;
                    state.avgLoss = state.initLosses.reduce((a, b) => a + b, 0) / period;
                    state.prevValue = currentValue;

                    const rsi = state.avgLoss === 0 ? 100 : 100 - 100 / (1 + state.avgGain / state.avgLoss);
                    return this.context.precision(rsi);
                }
                state.prevValue = currentValue;
                return NaN;
            }

            // Calculate RSI using smoothed averages (Wilder's smoothing)
            state.avgGain = (state.avgGain * (period - 1) + gain) / period;
            state.avgLoss = (state.avgLoss * (period - 1) + loss) / period;

            const rsi = state.avgLoss === 0 ? 100 : 100 - 100 / (1 + state.avgGain / state.avgLoss);
            state.prevValue = currentValue;
            return this.context.precision(rsi);
        }

        // First bar - just store the value
        state.prevValue = currentValue;
        return NaN;
    }

    atr(_period, _callId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;

        // Incremental ATR calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `atr_${period}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = {
                prevAtr: null,
                initSum: 0,
                initCount: 0,
                prevClose: null,
            };
        }

        const state = this.context.taState[stateKey];
        const idx = this.context.idx;
        const high = this.context.data.high[idx];
        const low = this.context.data.low[idx];
        const close = this.context.data.close[idx];

        // Calculate True Range
        let tr;
        if (state.prevClose !== null) {
            const hl = high - low;
            const hc = Math.abs(high - state.prevClose);
            const lc = Math.abs(low - state.prevClose);
            tr = Math.max(hl, hc, lc);
        } else {
            tr = high - low;
        }

        state.prevClose = close;

        if (state.initCount < period) {
            // Accumulate TR for SMA initialization
            state.initSum += tr;
            state.initCount++;

            if (state.initCount === period) {
                state.prevAtr = state.initSum / period;
                return this.context.precision(state.prevAtr);
            }
            return NaN;
        }

        // Calculate ATR using RMA formula
        const atr = (state.prevAtr * (period - 1) + tr) / period;
        state.prevAtr = atr;

        return this.context.precision(atr);
    }

    mom(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Momentum is same as change
        return this.change(source, length);
    }

    roc(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // ROC = ((current - previous) / previous) * 100
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `roc_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length <= length) {
            return NaN;
        }

        if (state.window.length > length + 1) {
            state.window.pop();
        }

        const prevValue = state.window[length];
        const roc = ((currentValue - prevValue) / prevValue) * 100;
        return this.context.precision(roc);
    }

    dev(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Mean Absolute Deviation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `dev_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source) || 0;

        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            const oldValue = state.window.pop();
            state.sum -= oldValue;
        }

        const mean = state.sum / length;
        let sumDeviation = 0;
        for (let i = 0; i < length; i++) {
            sumDeviation += Math.abs(state.window[i] - mean);
        }

        const dev = sumDeviation / length;
        return this.context.precision(dev);
    }

    variance(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Variance calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `variance_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        let sum = 0;
        let sumSquares = 0;
        for (let i = 0; i < length; i++) {
            sum += state.window[i];
            sumSquares += state.window[i] * state.window[i];
        }

        const mean = sum / length;
        const variance = sumSquares / length - mean * mean;

        return this.context.precision(variance);
    }

    highest(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Rolling maximum
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `highest_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        const max = Math.max(...state.window.filter((v) => !isNaN(v)));
        return this.context.precision(max);
    }

    lowest(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Rolling minimum
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `lowest_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        const validValues = state.window.filter((v) => !isNaN(v) && v !== undefined);
        const min = validValues.length > 0 ? Math.min(...validValues) : NaN;
        return this.context.precision(min);
    }

    median(source, _length, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;

        // Rolling median
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `median_${length}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        const sorted = state.window.slice().sort((a, b) => a - b);
        const mid = Math.floor(length / 2);
        const median = length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

        return this.context.precision(median);
    }

    stdev(source, _length, _bias = true, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const bias = Array.isArray(_bias) ? _bias[0] : _bias;

        // Standard Deviation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `stdev_${length}_${bias}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [], sum: 0 };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);
        state.sum += currentValue;

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            const oldValue = state.window.pop();
            state.sum -= oldValue;
        }

        const mean = state.sum / length;
        let sumSquaredDiff = 0;
        for (let i = 0; i < length; i++) {
            sumSquaredDiff += Math.pow(state.window[i] - mean, 2);
        }

        const divisor = bias ? length : length - 1;
        const stdev = Math.sqrt(sumSquaredDiff / divisor);

        return this.context.precision(stdev);
    }

    linreg(source, _length, _offset, _callId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const offset = Array.isArray(_offset) ? _offset[0] : _offset;

        // Linear Regression
        if (!this.context.taState) this.context.taState = {};
        const stateKey = _callId || `linreg_${length}_${offset}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = { window: [] };
        }

        const state = this.context.taState[stateKey];
        const currentValue = this.getCurrentValue(source);

        state.window.unshift(currentValue);

        if (state.window.length < length) {
            return NaN;
        }

        if (state.window.length > length) {
            state.window.pop();
        }

        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        const n = length;

        // Calculate regression coefficients
        // window[0] is most recent (x = length - 1), window[length-1] is oldest (x = 0)
        for (let j = 0; j < length; j++) {
            const x = length - 1 - j; // Most recent bar has highest x value
            const y = state.window[j];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        const denominator = n * sumXX - sumX * sumX;
        if (denominator === 0) {
            return NaN;
        }

        const slope = (n * sumXY - sumX * sumY) / denominator;
        const intercept = (sumY - slope * sumX) / n;

        // Pine formula: intercept + slope * (length - 1 - offset)
        const linRegValue = intercept + slope * (length - 1 - offset);

        return this.context.precision(linRegValue);
    }

    supertrend(_factor, _atrPeriod, _callId?) {
        const factor = Array.isArray(_factor) ? _factor[0] : _factor;
        const atrPeriod = Array.isArray(_atrPeriod) ? _atrPeriod[0] : _atrPeriod;

        // Incremental Supertrend calculation
        if (!this.context.taState) this.context.taState = {};
        const stateKey = `supertrend_${factor}_${atrPeriod}`;

        if (!this.context.taState[stateKey]) {
            this.context.taState[stateKey] = {
                prevUpperBand: null,
                prevLowerBand: null,
                prevSupertrend: null,
                prevDirection: null,
            };
        }

        const state = this.context.taState[stateKey];
        const idx = this.context.idx;
        const high = this.context.data.high[idx];
        const low = this.context.data.low[idx];
        const close = this.context.data.close[idx];

        // Get ATR value (already optimized) - use derived call ID
        const atrValue = this.atr(atrPeriod, _callId ? `${_callId}_atr` : undefined);

        if (isNaN(atrValue)) {
            return [[NaN, 0]];
        }

        const hl2 = (high + low) / 2;
        let upperBand = hl2 + factor * atrValue;
        let lowerBand = hl2 - factor * atrValue;

        // Adjust bands based on previous values
        if (state.prevUpperBand !== null) {
            if (upperBand < state.prevUpperBand || this.context.data.close[idx - 1] > state.prevUpperBand) {
                upperBand = upperBand;
            } else {
                upperBand = state.prevUpperBand;
            }

            if (lowerBand > state.prevLowerBand || this.context.data.close[idx - 1] < state.prevLowerBand) {
                lowerBand = lowerBand;
            } else {
                lowerBand = state.prevLowerBand;
            }
        }

        // Determine trend direction and supertrend value
        let direction;
        let supertrend;

        if (state.prevSupertrend === null) {
            // First valid bar
            direction = close <= upperBand ? -1 : 1;
            supertrend = direction === -1 ? upperBand : lowerBand;
        } else {
            if (state.prevSupertrend === state.prevUpperBand) {
                if (close > upperBand) {
                    direction = 1;
                    supertrend = lowerBand;
                } else {
                    direction = -1;
                    supertrend = upperBand;
                }
            } else {
                if (close < lowerBand) {
                    direction = -1;
                    supertrend = upperBand;
                } else {
                    direction = 1;
                    supertrend = lowerBand;
                }
            }
        }

        // Update state
        state.prevUpperBand = upperBand;
        state.prevLowerBand = lowerBand;
        state.prevSupertrend = supertrend;
        state.prevDirection = direction;

        return [[this.context.precision(supertrend), direction]];
    }

    crossover(source1, source2) {
        // Get current values
        const current1 = Array.isArray(source1) ? source1[0] : source1;
        const current2 = Array.isArray(source2) ? source2[0] : source2;

        // Get previous values
        const prev1 = Array.isArray(source1) ? source1[1] : this.context.data.series[source1][1];
        const prev2 = Array.isArray(source2) ? source2[1] : this.context.data.series[source2][1];

        // Check if source1 crossed above source2
        return prev1 < prev2 && current1 > current2;
    }

    crossunder(source1, source2) {
        // Get current values
        const current1 = Array.isArray(source1) ? source1[0] : source1;
        const current2 = Array.isArray(source2) ? source2[0] : source2;

        // Get previous values
        const prev1 = Array.isArray(source1) ? source1[1] : this.context.data.series[source1][1];
        const prev2 = Array.isArray(source2) ? source2[1] : this.context.data.series[source2][1];

        // Check if source1 crossed below source2
        return prev1 > prev2 && current1 < current2;
    }

    pivothigh(source, _leftbars, _rightbars) {
        //handle the case where source is not provided
        if (_rightbars == undefined) {
            _rightbars = _leftbars;
            _leftbars = source;

            //by default source is
            source = this.context.data.high;
        }
        const leftbars = Array.isArray(_leftbars) ? _leftbars[0] : _leftbars;
        const rightbars = Array.isArray(_rightbars) ? _rightbars[0] : _rightbars;

        const result = pivothigh(source.slice(0).reverse(), leftbars, rightbars);
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    pivotlow(source, _leftbars, _rightbars) {
        //handle the case where source is not provided
        if (_rightbars == undefined) {
            _rightbars = _leftbars;
            _leftbars = source;

            //by default source is
            source = this.context.data.low;
        }

        const leftbars = Array.isArray(_leftbars) ? _leftbars[0] : _leftbars;
        const rightbars = Array.isArray(_rightbars) ? _rightbars[0] : _rightbars;

        const result = pivotlow(source.slice(0).reverse(), leftbars, rightbars);
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }
}

//Here we did not use indicatorts implementation because it uses a different smoothing method which gives slightly different results that pine script
function atr(high: number[], low: number[], close: number[], period: number): number[] {
    // Calculate True Range first
    const tr = new Array(high.length);
    tr[0] = high[0] - low[0]; // First TR is just the first day's high-low range

    // Calculate subsequent TR values
    for (let i = 1; i < high.length; i++) {
        const hl = high[i] - low[i];
        const hc = Math.abs(high[i] - close[i - 1]);
        const lc = Math.abs(low[i] - close[i - 1]);
        tr[i] = Math.max(hl, hc, lc);
    }

    // Calculate ATR using RMA (Rolling Moving Average)
    const atr = new Array(high.length).fill(NaN);
    let sum = 0;

    // First ATR is SMA of first 'period' TR values
    for (let i = 0; i < period; i++) {
        sum += tr[i];
    }
    atr[period - 1] = sum / period;

    // Calculate subsequent ATR values using the RMA formula:
    // RMA = (previous RMA * (period-1) + current TR) / period
    for (let i = period; i < tr.length; i++) {
        atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
    }

    return atr;
}

function ema(source: number[], period: number): number[] {
    const result = new Array(source.length).fill(NaN);
    const alpha = 2 / (period + 1);

    // Initialize EMA with SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += source[i] || 0; //handle NaN values
    }
    result[period - 1] = sum / period;

    // Calculate EMA for remaining values
    for (let i = period; i < source.length; i++) {
        result[i] = source[i] * alpha + result[i - 1] * (1 - alpha);
    }

    return result;
}

function rsi(source: number[], period: number): number[] {
    const result = new Array(source.length).fill(NaN);
    const gains = new Array(source.length).fill(0);
    const losses = new Array(source.length).fill(0);

    // Calculate initial gains and losses
    for (let i = 1; i < source.length; i++) {
        const diff = source[i] - source[i - 1];
        gains[i] = diff > 0 ? diff : 0;
        losses[i] = diff < 0 ? -diff : 0;
    }

    // Calculate first RSI using simple averages
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= period; i++) {
        avgGain += gains[i];
        avgLoss += losses[i];
    }
    avgGain /= period;
    avgLoss /= period;

    // Calculate first RSI
    result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

    // Calculate subsequent RSIs using the smoothed averages
    for (let i = period + 1; i < source.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }

    return result;
}

function rma(source: number[], period: number): number[] {
    const result = new Array(source.length).fill(NaN);
    const alpha = 1 / period;

    // Initialize RMA with SMA for first value
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += source[i] || 0; // Handle NaN values
    }
    result[period - 1] = sum / period;

    // Calculate RMA for remaining values
    for (let i = period; i < source.length; i++) {
        const currentValue = source[i] || 0; // Handle NaN values
        result[i] = currentValue * alpha + result[i - 1] * (1 - alpha);
    }

    return result;
}

function sma(source: number[], period: number): number[] {
    const result = new Array(source.length).fill(NaN);

    // First (period-1) elements will remain NaN
    for (let i = period - 1; i < source.length; i++) {
        let sum = 0;
        for (let j = 0; j < period; j++) {
            sum += source[i - j] || 0;
        }
        result[i] = sum / period;
    }

    return result;
}

function vwma(source: number[], volume: number[], period: number): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = period - 1; i < source.length; i++) {
        let sumVol = 0;
        let sumVolPrice = 0;

        for (let j = 0; j < period; j++) {
            sumVol += volume[i - j];
            sumVolPrice += source[i - j] * volume[i - j];
        }

        result[i] = sumVolPrice / sumVol;
    }

    return result;
}

function hma(source, period) {
    const halfPeriod = Math.floor(period / 2);
    const wma1 = wma(source, halfPeriod);
    const wma2 = wma(source, period);
    const rawHma = wma1.map((value, index) => 2 * value - wma2[index]);
    const sqrtPeriod = Math.floor(Math.sqrt(period));
    const result = wma(rawHma, sqrtPeriod);
    return result;
}

function wma(source, period) {
    const result = new Array(source.length);

    for (let i = period - 1; i < source.length; i++) {
        let numerator = 0;
        let denominator = 0;

        for (let j = 0; j < period; j++) {
            numerator += source[i - j] * (period - j);
            denominator += period - j;
        }

        result[i] = numerator / denominator;
    }

    // Fill initial values with NaN or null
    for (let i = 0; i < period - 1; i++) {
        result[i] = NaN;
    }

    return result;
}

function change(source: number[], length: number = 1): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = length; i < source.length; i++) {
        result[i] = source[i] - source[i - length];
    }

    return result;
}

// DEMA = 2 * EMA(source, length) - EMA(EMA(source, length), length)
function dema(source: number[], length: number): number[] {
    const ema1 = ema(source, length);
    const ema2 = ema(ema1, length);
    return source.map((_, i) => 2 * ema1[i] - ema2[i]);
}

// TEMA = 3 * EMA1 - 3 * EMA2 + EMA3
function tema(source: number[], length: number): number[] {
    const ema1 = ema(source, length);
    const ema2 = ema(ema1, length);
    const ema3 = ema(ema2, length);
    return source.map((_, i) => 3 * ema1[i] - 3 * ema2[i] + ema3[i]);
}

// Momentum = current price - price 'length' periods ago
function mom(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);
    for (let i = length; i < source.length; i++) {
        result[i] = source[i] - source[i - length];
    }
    return result;
}

function roc(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);
    for (let i = length; i < source.length; i++) {
        result[i] = ((source[i] - source[i - length]) / source[i - length]) * 100;
    }
    return result;
}

function dev(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);

    // Calculate SMA first
    const smaValues = sma(source, length);

    // Calculate deviation
    for (let i = length - 1; i < source.length; i++) {
        let sumDeviation = 0;

        // Sum up absolute deviations from SMA
        for (let j = 0; j < length; j++) {
            sumDeviation += Math.abs(source[i - j] - smaValues[i]);
        }

        // Calculate average deviation
        result[i] = sumDeviation / length;
    }

    return result;
}

function variance(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = length - 1; i < source.length; i++) {
        let sum = 0;
        let sumSquares = 0;

        for (let j = 0; j < length; j++) {
            sum += source[i - j];
            sumSquares += source[i - j] * source[i - j];
        }

        const mean = sum / length;
        result[i] = sumSquares / length - mean * mean;
    }

    return result;
}

// Highest value for a given length
function highest(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = length - 1; i < source.length; i++) {
        let max = -Infinity;
        for (let j = 0; j < length; j++) {
            const value = source[i - j];
            if (isNaN(value)) {
                max = max === -Infinity ? NaN : max;
            } else {
                max = Math.max(max, value);
            }
        }
        result[i] = max;
    }

    return result;
}

// Lowest value for a given length
function lowest(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = length - 1; i < source.length; i++) {
        let min = Infinity;
        for (let j = 0; j < length; j++) {
            const value = source[i - j];
            if (isNaN(value) || value === undefined) {
                min = min === Infinity ? NaN : min;
            } else {
                min = Math.min(min, value);
            }
        }
        result[i] = min;
    }

    return result;
}

// Median over a given length
function median(source: number[], length: number): number[] {
    const result = new Array(source.length).fill(NaN);

    for (let i = length - 1; i < source.length; i++) {
        const window = source.slice(i - length + 1, i + 1);
        const sorted = window.slice().sort((a, b) => a - b);
        const mid = Math.floor(length / 2);

        result[i] = length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    return result;
}

function stdev(source: number[], length: number, biased: boolean = true): number[] {
    const result = new Array(source.length).fill(NaN);
    const smaValues = sma(source, length);

    for (let i = length - 1; i < source.length; i++) {
        let sum = 0;
        for (let j = 0; j < length; j++) {
            sum += Math.pow(source[i - j] - smaValues[i], 2);
        }
        // If biased is true, divide by n. If false (unbiased), divide by (n-1)
        const divisor = biased ? length : length - 1;
        result[i] = Math.sqrt(sum / divisor);
    }

    return result;
}

function linreg(source, length, offset) {
    const size = source.length;
    const output = new Array(size).fill(NaN);

    // We can only compute a regression starting at index = (length - 1)
    // because we need 'length' bars of history to look back.
    for (let i = length - 1; i < size; i++) {
        let sumX = 0;
        let sumY = 0;
        let sumXY = 0;
        let sumXX = 0;
        const n = length;

        // The oldest bar in the window => x=0 => source[i - length + 1]
        // The newest bar in the window => x=length - 1 => source[i]
        //
        // j goes from 0..(length-1), so:
        //   x = j
        //   y = source[i - length + 1 + j]
        for (let j = 0; j < length; j++) {
            const x = j;
            const y = source[i - length + 1 + j];
            sumX += x;
            sumY += y;
            sumXY += x * y;
            sumXX += x * x;
        }

        // slope = (n*sum(xy) - sum(x)*sum(y)) / (n*sum(x^2) - (sum(x))^2)
        const denominator = n * sumXX - sumX * sumX;
        if (denominator === 0) {
            // Edge case: all x the same? Should never happen when length>1,
            // but just in case we handle divide-by-zero
            output[i] = NaN;
            continue;
        }
        const slope = (n * sumXY - sumX * sumY) / denominator;

        // intercept = (sum(y) - slope * sum(x)) / n
        const intercept = (sumY - slope * sumX) / n;

        // Pine formula => intercept + slope*(length - 1 - offset)
        const linRegValue = intercept + slope * (length - 1 - offset);

        output[i] = linRegValue;
    }

    return output;
}

function calculateSupertrend(high: number[], low: number[], close: number[], factor: number, atrPeriod: number): [number[], number[]] {
    const length = high.length;
    const supertrend = new Array(length).fill(NaN);
    const direction = new Array(length).fill(0);

    // Calculate ATR
    const atrValues = atr(high, low, close, atrPeriod);

    // Calculate basic upper and lower bands
    const upperBand = new Array(length).fill(NaN);
    const lowerBand = new Array(length).fill(NaN);

    // Calculate initial bands
    for (let i = 0; i < length; i++) {
        const hl2 = (high[i] + low[i]) / 2;
        const atrValue = atrValues[i];

        if (!isNaN(atrValue)) {
            upperBand[i] = hl2 + factor * atrValue;
            lowerBand[i] = hl2 - factor * atrValue;
        }
    }

    // Initialize first valid values
    let prevUpperBand = upperBand[atrPeriod];
    let prevLowerBand = lowerBand[atrPeriod];
    let prevSupertrend = close[atrPeriod] <= prevUpperBand ? prevUpperBand : prevLowerBand;
    let prevDirection = close[atrPeriod] <= prevUpperBand ? -1 : 1;

    supertrend[atrPeriod] = prevSupertrend;
    direction[atrPeriod] = prevDirection;

    // Calculate Supertrend
    for (let i = atrPeriod + 1; i < length; i++) {
        // Calculate upper band
        let currentUpperBand = upperBand[i];
        if (currentUpperBand < prevUpperBand || close[i - 1] > prevUpperBand) {
            upperBand[i] = currentUpperBand;
        } else {
            upperBand[i] = prevUpperBand;
        }

        // Calculate lower band
        let currentLowerBand = lowerBand[i];
        if (currentLowerBand > prevLowerBand || close[i - 1] < prevLowerBand) {
            lowerBand[i] = currentLowerBand;
        } else {
            lowerBand[i] = prevLowerBand;
        }

        // Set trend direction and value
        if (prevSupertrend === prevUpperBand) {
            if (close[i] > upperBand[i]) {
                direction[i] = 1;
                supertrend[i] = lowerBand[i];
            } else {
                direction[i] = -1;
                supertrend[i] = upperBand[i];
            }
        } else {
            if (close[i] < lowerBand[i]) {
                direction[i] = -1;
                supertrend[i] = upperBand[i];
            } else {
                direction[i] = 1;
                supertrend[i] = lowerBand[i];
            }
        }

        // Update previous values
        prevUpperBand = upperBand[i];
        prevLowerBand = lowerBand[i];
        prevSupertrend = supertrend[i];
    }

    return [supertrend, direction];
}

// Pivot high identifies a local high point
function pivothigh(source: number[], leftbars: number, rightbars: number): number[] {
    const result = new Array(source.length).fill(NaN);

    // We need at least leftbars + rightbars + 1 (for the center point) values
    for (let i = leftbars + rightbars; i < source.length; i++) {
        const pivot = source[i - rightbars];
        let isPivot = true;

        // Check if the pivot is higher than all bars to the left within leftbars range
        for (let j = 1; j <= leftbars; j++) {
            if (source[i - rightbars - j] >= pivot) {
                isPivot = false;
                break;
            }
        }

        // Check if the pivot is higher than all bars to the right within rightbars range
        if (isPivot) {
            for (let j = 1; j <= rightbars; j++) {
                if (source[i - rightbars + j] >= pivot) {
                    isPivot = false;
                    break;
                }
            }
        }

        // If this is a pivot point, set its value, otherwise keep NaN
        if (isPivot) {
            result[i] = pivot;
        }
    }

    return result;
}

// Pivot low identifies a local low point
function pivotlow(source: number[], leftbars: number, rightbars: number): number[] {
    const result = new Array(source.length).fill(NaN);

    // We need at least leftbars + rightbars + 1 (for the center point) values
    for (let i = leftbars + rightbars; i < source.length; i++) {
        const pivot = source[i - rightbars];
        let isPivot = true;

        // Check if the pivot is lower than all bars to the left within leftbars range
        for (let j = 1; j <= leftbars; j++) {
            if (source[i - rightbars - j] <= pivot) {
                isPivot = false;
                break;
            }
        }

        // Check if the pivot is lower than all bars to the right within rightbars range
        if (isPivot) {
            for (let j = 1; j <= rightbars; j++) {
                if (source[i - rightbars + j] <= pivot) {
                    isPivot = false;
                    break;
                }
            }
        }

        // If this is a pivot point, set its value, otherwise keep NaN
        if (isPivot) {
            result[i] = pivot;
        }
    }

    return result;
}

export default TechnicalAnalysis;
