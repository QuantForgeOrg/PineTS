# Mock Market Data Provider

This directory contains mock market data files and a reusable MockProvider for unit tests.

## Files

-   `BTCUSDC-1h-1704067200000-1763683199000.json` - Hourly BTCUSDC candles from 2024-01-01 to 2025-11-20 (16,560 candles)
-   `BTCUSDC-1d-1704067200000-1763683199000.json` - Daily BTCUSDC candles from 2024-01-01 to 2025-11-20 (690 candles)
-   `mock-provider.test.ts` - Unit tests for MockProvider
-   `market.ts` - Script to fetch hourly candles
-   `fetch-daily.ts` - Script to fetch daily candles

## Usage

### Basic Usage

```typescript
import { Provider } from '@pinets/marketData/Provider.class';
import { PineTS } from '@pinets/index';

// Use MockProvider instead of Binance provider
// Hourly candles
const pineTSHourly = new PineTS(Provider.Mock, 'BTCUSDC', '1h', null, new Date('2024-01-01').getTime(), new Date('2024-01-10').getTime());

// Daily candles
const pineTSDaily = new PineTS(Provider.Mock, 'BTCUSDC', '1d', null, new Date('2024-01-01').getTime(), new Date('2024-12-31').getTime());

const { result } = await pineTS.run((context) => {
    const { close } = context.data;
    const ta = context.ta;
    const sma = ta.sma(close, 9);
    return { sma };
});
```

### Direct Provider Usage

```typescript
import { MockProvider } from '@pinets/marketData/Mock/MockProvider.class';

const provider = new MockProvider();

// Get market data with date range
const data = await provider.getMarketData(
    'BTCUSDC',
    '1h',
    undefined, // limit (optional)
    new Date('2024-01-01').getTime(), // startTime
    new Date('2024-01-02').getTime() // endTime
);

// Get market data with limit
const limitedData = await provider.getMarketData(
    'BTCUSDC',
    '1h',
    100 // limit to 100 candles
);
```

### Custom Data Directory

```typescript
import { MockProvider } from '@pinets/marketData/Mock/MockProvider.class';

// Use custom directory for mock data files
const provider = new MockProvider('/path/to/custom/data/directory');
```

## File Naming Convention

Mock data files should follow this naming pattern:

```
{SYMBOL}-{TIMEFRAME}-{START_TIME}-{END_TIME}.json
```

Examples:

-   `BTCUSDC-1h-1704067200000-1763683199000.json`
-   `BTCUSDT-1d-1704067200000-1763683199000.json`

## Supported Timeframes

The MockProvider supports the same timeframe formats as BinanceProvider:

-   `'1'` or `'1m'` - 1 minute
-   `'3'` or `'3m'` - 3 minutes
-   `'5'` or `'5m'` - 5 minutes
-   `'15'` or `'15m'` - 15 minutes
-   `'30'` or `'30m'` - 30 minutes
-   `'60'` or `'1h'` - 1 hour
-   `'120'` or `'2h'` - 2 hours
-   `'240'` or `'4h'` - 4 hours
-   `'D'` or `'1D'` or `'1d'` - 1 day
-   `'W'` or `'1W'` or `'1w'` - 1 week
-   `'M'` or `'1M'` - 1 month

## Data Format

Each candle in the JSON file should have this structure:

```typescript
{
    openTime: number; // Opening time (timestamp in milliseconds)
    open: number; // Opening price
    high: number; // Highest price
    low: number; // Lowest price
    close: number; // Closing price
    volume: number; // Volume
    closeTime: number; // Closing time (timestamp in milliseconds)
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: number;
    takerBuyQuoteAssetVolume: number;
    ignore: number | string;
}
```

## Benefits

1. **Fast**: No API calls, reads from local JSON files
2. **Reliable**: Consistent test data, no network issues
3. **Offline**: Works without internet connection
4. **Reproducible**: Same data every time
5. **Easy to Debug**: Can inspect JSON files directly

## Generating Mock Data

Use the provided scripts to fetch and save market data:

### Hourly Candles

```bash
cd tests/compatibility/_data
npx tsx market.ts
```

This creates: `BTCUSDC-1h-1704067200000-1763683199000.json`

### Daily Candles

```bash
cd tests/compatibility/_data
npx tsx fetch-daily.ts
```

This creates: `BTCUSDC-1d-1704067200000-1763683199000.json`

Both scripts create JSON files with the naming pattern `{SYMBOL}-{TIMEFRAME}-{START_TIME}-{END_TIME}.json`.
