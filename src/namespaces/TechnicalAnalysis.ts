// SPDX-License-Identifier: AGPL-3.0-only
export class TechnicalAnalysis {
    constructor(private context: any) {}

    public get tr() {
        const val = this.context.math.max(
            this.context.data.high[0] - this.context.data.low[0],
            this.context.math.abs(this.context.data.high[0] - this.context.data.close[1]),
            this.context.math.abs(this.context.data.low[0] - this.context.data.close[1])
        );
        return val;
    }

    param(source, index, name?: string) {
        if (!this.context.params[name]) this.context.params[name] = [];
        if (Array.isArray(source)) {
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

    ema(source, _period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'ema_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid previous EMA and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1 && !isNaN(cache.lastEMA)) {
            // New bar: compute only the new EMA value using the incremental formula
            const alpha = 2 / (period + 1);
            const newValue = source[0] * alpha + cache.lastEMA * (1 - alpha);

            cache.lastEMA = newValue;
            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(newValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = ema(source.slice(0).reverse(), period);
        // The result array has sourceLength elements [0...sourceLength-1]
        // The last element (sourceLength-1) is the current bar's EMA
        const value = result[sourceLength - 1];

        // Update cache for next incremental calculation
        cache.lastEMA = value;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    sma(source, _period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'sma_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            // New bar: update rolling sum
            const newValue = source[0];
            const oldValue = sourceLength > period ? source[period] : 0;

            cache.rollingSum = cache.rollingSum - oldValue + newValue;
            const smaValue = cache.rollingSum / period;

            cache.lastSMA = smaValue;
            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(smaValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = sma(source.slice(0).reverse(), period);
        // The result array has sourceLength elements [0...sourceLength-1]
        // The last element (sourceLength-1) is the current bar's SMA
        const value = result[sourceLength - 1];

        // Calculate rolling sum for cache
        let rollingSum = 0;
        for (let i = 0; i < Math.min(period, sourceLength); i++) {
            rollingSum += source[i] || 0;
        }

        // Update cache for next incremental calculation
        cache.rollingSum = rollingSum;
        cache.lastSMA = value;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    vwma(source, _period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'vwma_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;
        const volume = this.context.data.volume;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            const newValue = source[0];
            const newVolume = volume[0];
            const oldValue = sourceLength > period ? source[period] : 0;
            const oldVolume = sourceLength > period ? volume[period] : 0;

            cache.rollingVolumeSum = cache.rollingVolumeSum - oldVolume + newVolume;
            cache.rollingVolumePriceSum = cache.rollingVolumePriceSum - oldValue * oldVolume + newValue * newVolume;

            const vwmaValue = cache.rollingVolumeSum !== 0 ? cache.rollingVolumePriceSum / cache.rollingVolumeSum : 0;

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(vwmaValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = vwma(source.slice(0).reverse(), volume.slice(0).reverse(), period);
        const value = result[sourceLength - 1];

        // Calculate rolling sums for cache
        let rollingVolumeSum = 0;
        let rollingVolumePriceSum = 0;
        for (let i = 0; i < Math.min(period, sourceLength); i++) {
            rollingVolumeSum += volume[i];
            rollingVolumePriceSum += source[i] * volume[i];
        }

        // Update cache for next incremental calculation
        cache.rollingVolumeSum = rollingVolumeSum;
        cache.rollingVolumePriceSum = rollingVolumePriceSum;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    wma(source, _period) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const result = wma(source.slice(0).reverse(), period);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    hma(source, _period) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const result = hma(source.slice(0).reverse(), period);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    rma(source, _period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'rma_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid previous RMA and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1 && !isNaN(cache.lastRMA)) {
            // New bar: compute only the new RMA value using the incremental formula
            // RMA formula: (previous RMA * (period-1) + current value) / period
            const alpha = 1 / period;
            const newValue = source[0] * alpha + cache.lastRMA * (1 - alpha);

            cache.lastRMA = newValue;
            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(newValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = rma(source.slice(0).reverse(), period);
        const value = result[sourceLength - 1];

        // Update cache for next incremental calculation
        cache.lastRMA = value;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    change(source, _length = 1) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const result = change(source.slice(0).reverse(), length);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    rsi(source, _period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'rsi_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            // Calculate current change
            const currentValue = source[0];
            const previousValue = source[1];
            const diff = currentValue - previousValue;

            // Update average gain and loss using RMA formula
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            cache.avgGain = (cache.avgGain * (period - 1) + gain) / period;
            cache.avgLoss = (cache.avgLoss * (period - 1) + loss) / period;

            // Calculate RSI
            const rs = cache.avgLoss === 0 ? 100 : cache.avgGain / cache.avgLoss;
            const rsiValue = 100 - 100 / (1 + rs);

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(rsiValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = rsi(source.slice(0).reverse(), period);
        const value = result[sourceLength - 1];

        // Calculate and store average gain/loss for next incremental calculation
        const gains = [];
        const losses = [];
        const reversed = source.slice(0).reverse();

        for (let i = 1; i <= period && i < reversed.length; i++) {
            const diff = reversed[sourceLength - i] - reversed[sourceLength - i - 1];
            gains.push(diff > 0 ? diff : 0);
            losses.push(diff < 0 ? -diff : 0);
        }

        let avgGain = gains.reduce((a, b) => a + b, 0) / period;
        let avgLoss = losses.reduce((a, b) => a + b, 0) / period;

        // Apply RMA smoothing for values after the first period
        for (let i = period + 1; i < sourceLength; i++) {
            const diff = reversed[i] - reversed[i - 1];
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;
            avgGain = (avgGain * (period - 1) + gain) / period;
            avgLoss = (avgLoss * (period - 1) + loss) / period;
        }

        // Update cache for next incremental calculation
        cache.avgGain = avgGain;
        cache.avgLoss = avgLoss;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    atr(_period, _cacheId?) {
        const period = Array.isArray(_period) ? _period[0] : _period;
        const cacheId = _cacheId || 'atr_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const high = this.context.data.high;
        const low = this.context.data.low;
        const close = this.context.data.close;
        const sourceLength = high.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1 && !isNaN(cache.lastATR)) {
            // Calculate current TR
            const currentHigh = high[0];
            const currentLow = low[0];
            const previousClose = close[1];

            const hl = currentHigh - currentLow;
            const hc = Math.abs(currentHigh - previousClose);
            const lc = Math.abs(currentLow - previousClose);
            const tr = Math.max(hl, hc, lc);

            // Update ATR using RMA formula: (previous ATR * (period-1) + current TR) / period
            const atrValue = (cache.lastATR * (period - 1) + tr) / period;

            cache.lastATR = atrValue;
            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(atrValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const highReversed = high.slice().reverse();
        const lowReversed = low.slice().reverse();
        const closeReversed = close.slice().reverse();
        const result = atr(highReversed, lowReversed, closeReversed, period);
        const value = result[sourceLength - 1];

        // Update cache for next incremental calculation
        cache.lastATR = value;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    mom(source, _length) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const result = mom(source.slice(0).reverse(), length);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    roc(source, _length) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const result = roc(source.slice(0).reverse(), length);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    dev(source, _length, _cacheId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const cacheId = _cacheId || 'dev_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            // Update rolling sum (for SMA calculation)
            const newValue = source[0];
            const oldValue = sourceLength > length ? source[length] : 0;

            cache.rollingSum = cache.rollingSum - oldValue + newValue;
            const sma = cache.rollingSum / length;

            // Calculate sum of absolute deviations from SMA
            let sumDeviation = 0;
            for (let i = 0; i < Math.min(length, sourceLength); i++) {
                sumDeviation += Math.abs(source[i] - sma);
            }

            const devValue = sumDeviation / length;

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(devValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = dev(source.slice(0).reverse(), length);
        const value = result[sourceLength - 1];

        // Calculate rolling sum for cache
        let rollingSum = 0;
        for (let i = 0; i < Math.min(length, sourceLength); i++) {
            rollingSum += source[i] || 0;
        }

        // Update cache for next incremental calculation
        cache.rollingSum = rollingSum;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    variance(source, _length) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const result = variance(source.slice(0).reverse(), length);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    highest(source, _length, _cacheId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const cacheId = _cacheId || 'highest_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false, window: [] };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            const newValue = source[0];

            // Add new value to the front of window
            cache.window.unshift(newValue);

            // Remove old value if window exceeds length
            if (cache.window.length > length) {
                cache.window.pop();
            }

            // Find maximum in window
            let max = -Infinity;
            for (let i = 0; i < cache.window.length; i++) {
                const val = cache.window[i];
                if (!isNaN(val) && val !== undefined) {
                    max = Math.max(max, val);
                }
            }

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(max === -Infinity ? NaN : max);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = highest(source.slice(0).reverse(), length);
        const value = result[sourceLength - 1];

        // Build window for cache
        cache.window = [];
        for (let i = 0; i < Math.min(length, sourceLength); i++) {
            cache.window.push(source[i]);
        }

        // Update cache for next incremental calculation
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    lowest(source, _length, _cacheId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const cacheId = _cacheId || 'lowest_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false, window: [] };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            const newValue = source[0];

            // Add new value to the front of window
            cache.window.unshift(newValue);

            // Remove old value if window exceeds length
            if (cache.window.length > length) {
                cache.window.pop();
            }

            // Find minimum in window
            let min = Infinity;
            for (let i = 0; i < cache.window.length; i++) {
                const val = cache.window[i];
                if (!isNaN(val) && val !== undefined) {
                    min = Math.min(min, val);
                }
            }

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(min === Infinity ? NaN : min);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = lowest(source.slice(0).reverse(), length);
        const value = result[sourceLength - 1];

        // Build window for cache
        cache.window = [];
        for (let i = 0; i < Math.min(length, sourceLength); i++) {
            cache.window.push(source[i]);
        }

        // Update cache for next incremental calculation
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    median(source, _length) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const result = median(source.slice(0).reverse(), length);
        //return result.reverse();
        const idx = this.context.idx;
        return this.context.precision(result[idx]);
    }

    stdev(source, _length, _bias = true, _cacheId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const bias = Array.isArray(_bias) ? _bias[0] : _bias;
        const cacheId = _cacheId || 'stdev_default';

        // Initialize cache if it doesn't exist
        if (!this.context.cache[cacheId]) {
            this.context.cache[cacheId] = { initialized: false };
        }

        const cache = this.context.cache[cacheId];
        const currentIdx = this.context.idx;
        const sourceLength = source.length;

        // Incremental computation: only when we have valid state and moving forward by 1 bar
        if (cache.initialized && cache.lastIdx === currentIdx - 1 && sourceLength === cache.lastSourceLength + 1) {
            // Update rolling sum and sum of squares
            const newValue = source[0];
            const oldValue = sourceLength > length ? source[length] : 0;

            cache.rollingSum = cache.rollingSum - oldValue + newValue;
            cache.rollingSumSquares = cache.rollingSumSquares - oldValue * oldValue + newValue * newValue;

            // Calculate mean and variance
            const mean = cache.rollingSum / length;
            const variance = cache.rollingSumSquares / length - mean * mean;

            // Calculate standard deviation
            const divisor = bias ? length : length - 1;
            const stdevValue = Math.sqrt((variance * length) / divisor);

            cache.lastIdx = currentIdx;
            cache.lastSourceLength = sourceLength;

            return this.context.precision(stdevValue);
        }

        // Full calculation: needed on first run or when cache is invalid
        const result = stdev(source.slice(0).reverse(), length, bias);
        const value = result[sourceLength - 1];

        // Calculate rolling sum and sum of squares for cache
        let rollingSum = 0;
        let rollingSumSquares = 0;
        for (let i = 0; i < Math.min(length, sourceLength); i++) {
            const val = source[i] || 0;
            rollingSum += val;
            rollingSumSquares += val * val;
        }

        // Update cache for next incremental calculation
        cache.rollingSum = rollingSum;
        cache.rollingSumSquares = rollingSumSquares;
        cache.lastIdx = currentIdx;
        cache.lastSourceLength = sourceLength;
        cache.initialized = true;

        return this.context.precision(value);
    }

    linreg(source, _length, _offset, _cacheId?) {
        const length = Array.isArray(_length) ? _length[0] : _length;
        const offset = Array.isArray(_offset) ? _offset[0] : _offset;

        // LINREG is complex for true incremental calculation with sliding windows
        // The X coordinates change as the window slides, requiring full recalculation
        // Since it's not heavily used, we skip caching for now
        const result = linreg(source.slice(0).reverse(), length, offset);
        const sourceLength = source.length;
        const value = result[sourceLength - 1];

        return this.context.precision(value);
    }

    supertrend(_factor, _atrPeriod) {
        const factor = Array.isArray(_factor) ? _factor[0] : _factor;
        const atrPeriod = Array.isArray(_atrPeriod) ? _atrPeriod[0] : _atrPeriod;

        const high = this.context.data.high.slice().reverse();
        const low = this.context.data.low.slice().reverse();
        const close = this.context.data.close.slice().reverse();
        const [supertrend, direction] = calculateSupertrend(high, low, close, factor, atrPeriod);

        const idx = this.context.idx;
        return [[this.context.precision(supertrend[idx]), direction[idx]]];
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
