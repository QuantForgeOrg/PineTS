---
layout: default
title: Pagination & Live Streaming
nav_order: 4
permalink: /pagination/
---

# Pagination & Live Streaming

## Overview

PineTS supports **pagination** for processing large datasets efficiently and **live streaming** for real-time market data. This enables you to:

-   Process historical data in manageable chunks
-   Build responsive UIs that show progress
-   Stream live market data as new candles form
-   Build real-time trading bots and monitoring systems

## Why Use Pagination?

### Memory Efficiency

Instead of loading all results at once, pagination yields results page by page, reducing memory footprint for large datasets.

### Progress Tracking

Display progress bars or updates as data is processed, improving user experience.

### Real-Time Updates

Automatically fetch and process new market data as it becomes available, perfect for live trading applications.

## Basic Pagination

### Simple Example

```typescript
import { PineTS } from 'pinets';

// Load historical data
const klines = await getKlines('BTCUSDT', '1h', 500);
const pineTS = new PineTS(klines);

const indicator = (context) => {
    const { close } = context.data;
    const ta = context.ta;

    const sma = ta.sma(close, 20);
    return { sma };
};

// Process 100 candles in pages of 10
const iterator = pineTS.run(indicator, 100, 10);

for await (const page of iterator) {
    console.log(`Received ${page.result.sma.length} results`);
    // Process each page as it becomes available
}
```

### How It Works

1. **Specify page size**: The third parameter to `run()` enables pagination
2. **Iterate through pages**: Use `for await` to process each page
3. **Each page is independent**: Contains only new results (not cumulative)
4. **Automatic completion**: Iterator finishes when all data is processed

## Accumulating Results

If you need the complete dataset, accumulate results from each page:

```typescript
const allResults = [];

const iterator = pineTS.run(indicator, 100, 10);

for await (const page of iterator) {
    allResults.push(...page.result.sma);
    console.log(`Progress: ${allResults.length}/100`);
}

console.log('Complete results:', allResults);
```

## Handling Partial Pages

The last page may contain fewer results than the page size:

```typescript
// 100 candles with page size of 30
// Results: 30, 30, 30, 10 (last page is partial)

const iterator = pineTS.run(indicator, 100, 30);

let pageNum = 0;
for await (const page of iterator) {
    pageNum++;
    const count = page.result.sma.length;
    console.log(`Page ${pageNum}: ${count} results`);
}
```

## Live Streaming

Live streaming automatically fetches new market data as it becomes available. This is perfect for:

-   Real-time trading bots
-   Live dashboards
-   Alert systems
-   Market monitoring

### Automatic Live Mode

Live streaming is **automatically enabled** when:

-   ✅ You use a **provider** (not a static array)
-   ✅ No **end date** (`eDate`) is specified

```typescript
import { PineTS, Providers } from 'pinets';

// Create with a provider (Binance) and no end date
const pineTS = new PineTS(
    Providers.Binance,
    'BTCUSDT',
    '1m' // 1-minute candles
);

const indicator = (context) => {
    const { close } = context.data;
    const ta = context.ta;
    return {
        sma: ta.sma(close, 20),
        rsi: ta.rsi(close, 14),
    };
};

// Process 50 historical candles, then continue with live data
const iterator = pineTS.run(indicator, 50, 10);

for await (const page of iterator) {
    if (page === null) {
        // No new data yet, wait before checking again
        await sleep(1000);
        continue;
    }

    const { sma, rsi } = page.result;
    console.log(`New data: SMA=${sma[sma.length - 1]}, RSI=${rsi[rsi.length - 1]}`);

    // This loop continues indefinitely, processing new candles
}
```

### Live Mode Behavior

**During live streaming:**

1. **Historical pages complete first** - processes all requested historical data
2. **Checks for new candles** - automatically fetches latest market data
3. **Updates open candles** - recalculates the current candle as it forms
4. **Yields new results** - returns new/updated data as soon as available
5. **Yields `null`** - when no new data is available (market closed, no updates)

### Disabling Live Mode

To process only historical data (no live streaming), specify an end date:

```typescript
const endDate = Date.now(); // Current time

const pineTS = new PineTS(
    Providers.Binance,
    'BTCUSDT',
    '1h',
    500, // limit
    undefined, // start date
    endDate // end date - disables live mode
);

const iterator = pineTS.run(indicator, 100, 10);
// Will stop after historical data, no live streaming
```

## Real-World Examples

### Example 1: Progress Bar for Backtesting

```typescript
const totalCandles = 1000;
const pageSize = 50;

const iterator = pineTS.run(indicator, totalCandles, pageSize);

let processed = 0;
for await (const page of iterator) {
    processed += page.result.sma.length;
    const progress = ((processed / totalCandles) * 100).toFixed(1);
    console.log(`Progress: ${'█'.repeat(processed / 20)}${' '.repeat((totalCandles - processed) / 20)} ${progress}%`);
}
```

### Example 2: Live Trading Signal Monitor

```typescript
const pineTS = new PineTS(Providers.Binance, 'BTCUSDT', '5m');

const strategy = (context) => {
    const { close, volume } = context.data;
    const ta = context.ta;

    const ema20 = ta.ema(close, 20);
    const ema50 = ta.ema(close, 50);
    const rsi = ta.rsi(close, 14);

    const bullish = ema20 > ema50 && rsi < 30;
    const bearish = ema20 < ema50 && rsi > 70;

    return { ema20, ema50, rsi, bullish, bearish };
};

const iterator = pineTS.run(strategy, 100, 10);

console.log('Monitoring BTCUSDT for signals...');

for await (const page of iterator) {
    if (page === null) {
        await sleep(5000); // Wait 5 seconds before checking again
        continue;
    }

    const lastIdx = page.result.bullish.length - 1;

    if (page.result.bullish[lastIdx]) {
        sendAlert('🟢 BULLISH SIGNAL: Consider buying');
    }

    if (page.result.bearish[lastIdx]) {
        sendAlert('🔴 BEARISH SIGNAL: Consider selling');
    }
}
```

### Example 3: Multiple Timeframe Analysis

```typescript
// Analyze multiple timeframes simultaneously
const timeframes = ['1m', '5m', '15m', '1h'];

const analyzers = timeframes.map((tf) => {
    const pineTS = new PineTS(Providers.Binance, 'BTCUSDT', tf);
    return {
        timeframe: tf,
        iterator: pineTS.run(indicator, 50, 10),
    };
});

// Process all timeframes concurrently
await Promise.all(
    analyzers.map(async ({ timeframe, iterator }) => {
        for await (const page of iterator) {
            if (page === null) continue;

            console.log(`[${timeframe}] Latest RSI: ${page.result.rsi[page.result.rsi.length - 1]}`);
        }
    })
);
```

### Example 4: Data Export with Pagination

```typescript
import { writeFileSync } from 'fs';

const results = {
    timestamps: [],
    close: [],
    sma: [],
    ema: [],
};

const iterator = pineTS.run(indicator, 5000, 100);

for await (const page of iterator) {
    // Accumulate data for export
    results.sma.push(...page.result.sma);
    results.ema.push(...page.result.ema);
}

// Export to CSV
const csv = results.sma.map((sma, i) => `${i},${results.close[i]},${sma},${results.ema[i]}`).join('\n');

writeFileSync('analysis.csv', 'index,close,sma,ema\n' + csv);
```

## Understanding Open vs Closed Candles

### What Are Open Candles?

In live trading, the **current candle** is still forming - its high, low, close, and volume are constantly changing. This is called an **open candle**.

### How PineTS Handles Open Candles

When live streaming, PineTS:

1. **Always recalculates the last candle** when fetching new data
2. **Updates OHLCV values** with the latest market data
3. **Recalculates all indicators** for the updated candle
4. **Returns updated results** so your indicators stay current

```typescript
// Example: Watching a candle form in real-time
const iterator = pineTS.run(indicator, 20, 5);

let previousClose = null;

for await (const page of iterator) {
    if (page === null) {
        await sleep(1000);
        continue;
    }

    const lastSMA = page.result.sma[page.result.sma.length - 1];
    const currentClose = page.result.close?.[page.result.close.length - 1];

    if (previousClose !== null && currentClose !== previousClose) {
        console.log('⚡ Candle updated:', { previousClose, currentClose, lastSMA });
    }

    previousClose = currentClose;
}
```

## Performance Considerations

### Choose Appropriate Page Sizes

-   **Small pages (5-20)**: More responsive, good for live streaming
-   **Medium pages (50-100)**: Balanced for backtesting with progress updates
-   **Large pages (500+)**: Minimize overhead for bulk processing

### Memory Usage

Pagination significantly reduces memory usage:

```typescript
// Non-paginated: Loads all 10,000 results at once
const { result } = await pineTS.run(indicator, 10000);

// Paginated: Only 100 results in memory at a time
for await (const page of pineTS.run(indicator, 10000, 100)) {
    processPage(page); // Process and discard
}
```

### Network Efficiency (Live Streaming)

Live streaming automatically optimizes network usage:

-   Fetches only new/updated candles
-   Reuses existing historical data
-   Minimal API calls to exchange

## Best Practices

### ✅ Do's

-   **Use pagination for large datasets** (>1000 candles)
-   **Enable live streaming for real-time applications**
-   **Handle `null` yields** when no new data is available
-   **Accumulate results if you need the complete dataset**
-   **Use try-catch** for error handling in production

### ❌ Don'ts

-   **Don't assume all pages are the same size** (last page may be partial)
-   **Don't forget to await** in async generators
-   **Don't process faster than market updates** (add sleep when no data)
-   **Don't ignore `null` yields** - they signal no new data

## Error Handling

```typescript
const iterator = pineTS.run(indicator, 100, 10);

try {
    for await (const page of iterator) {
        if (page === null) {
            await sleep(1000);
            continue;
        }

        // Process page
        processResults(page.result);
    }
} catch (error) {
    console.error('Error during pagination:', error);

    if (error.message.includes('network')) {
        // Handle network errors (reconnect, retry, etc.)
    }

    if (error.message.includes('rate limit')) {
        // Handle rate limiting
        await sleep(60000); // Wait 1 minute
    }
}
```

## Comparison: With vs Without Pagination

### Without Pagination (Traditional)

```typescript
// Process everything at once
const { result } = await pineTS.run(indicator, 5000);

// ❌ No progress feedback
// ❌ High memory usage
// ❌ No live updates
// ❌ Must wait for completion

console.log('Results:', result.sma);
```

### With Pagination

```typescript
// Process in chunks
const iterator = pineTS.run(indicator, 5000, 100);

// ✅ Progress updates
// ✅ Low memory usage
// ✅ Can stream live data
// ✅ Responsive processing

for await (const page of iterator) {
    console.log(`Processed ${page.result.sma.length} more results`);
    updateUI(page.result);
}
```

## API Reference

### `run()` Method Signatures

```typescript
// Non-paginated
run(indicator: Function, periods?: number): Promise<Context>

// Paginated (auto-detects live mode)
run(indicator: Function, periods?: number, pageSize: number): AsyncGenerator<Context>
```

### Parameters

| Parameter   | Type     | Required | Description                                           |
| ----------- | -------- | -------- | ----------------------------------------------------- |
| `indicator` | Function | Yes      | Your Pine Script indicator function                   |
| `periods`   | number   | No       | Number of candles to process (default: all available) |
| `pageSize`  | number   | No       | Results per page (enables pagination if > 0)          |

### Return Values

**Non-paginated:** Returns `Promise<Context>` with all results

**Paginated:** Returns `AsyncGenerator<Context>` that yields:

-   `Context` objects with page results
-   `null` when no new data (live streaming only)

## Next Steps

-   Check out [API Coverage](../api-coverage/) for available indicators
-   See [Getting Started](../getting-started/) for basic setup
-   View [Live Examples](../indicators/) for real indicators

## Questions?

For issues or questions, visit our [GitHub repository](https://github.com/alaa-eddine/PineTS).
