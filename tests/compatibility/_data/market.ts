import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Fetches hourly candles for BTCUSDC from Binance API
 * Date range: 01-01-2024 to 20-11-2025
 * Uses direct URL fetching with pagination
 */

const BINANCE_API_URL = 'https://api.binance.com/api/v3';
const SYMBOL = 'BTCUSDC';
const INTERVAL = '1h'; // Hourly candles
const MAX_LIMIT = 1000; // Binance API max limit per request

// Date range: 01-01-2024 to 20-11-2025
const START_DATE = new Date('2024-01-01T00:00:00Z');
const END_DATE = new Date('2025-11-20T23:59:59Z');

interface Kline {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    closeTime: number;
    quoteAssetVolume: number;
    numberOfTrades: number;
    takerBuyBaseAssetVolume: number;
    takerBuyQuoteAssetVolume: number;
    ignore: number;
}

/**
 * Fetches a batch of klines from Binance API
 */
async function fetchKlinesBatch(symbol: string, interval: string, startTime: number, endTime: number, limit: number = MAX_LIMIT): Promise<Kline[]> {
    const url = `${BINANCE_API_URL}/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=${limit}`;

    console.log(`Fetching batch: ${new Date(startTime).toISOString()} to ${new Date(endTime).toISOString()}`);

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Transform Binance API response to our format
        const klines: Kline[] = data.map((item: any[]) => ({
            openTime: item[0],
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
            closeTime: item[6],
            quoteAssetVolume: parseFloat(item[7]),
            numberOfTrades: parseInt(item[8]),
            takerBuyBaseAssetVolume: parseFloat(item[9]),
            takerBuyQuoteAssetVolume: parseFloat(item[10]),
            ignore: item[11],
        }));

        return klines;
    } catch (error) {
        console.error(`Error fetching klines batch:`, error);
        throw error;
    }
}

/**
 * Fetches all klines with pagination
 */
async function fetchAllKlines(symbol: string, interval: string, startTime: number, endTime: number): Promise<Kline[]> {
    const allKlines: Kline[] = [];
    let currentStartTime = startTime;
    let batchNumber = 1;

    while (currentStartTime < endTime) {
        console.log(`\nFetching batch ${batchNumber}...`);

        const batch = await fetchKlinesBatch(symbol, interval, currentStartTime, endTime, MAX_LIMIT);

        if (batch.length === 0) {
            console.log('No more data available');
            break;
        }

        allKlines.push(...batch);
        console.log(`Batch ${batchNumber}: Fetched ${batch.length} candles. Total: ${allKlines.length}`);

        // If we got less than the max limit, we've reached the end
        if (batch.length < MAX_LIMIT) {
            console.log('Reached end of data');
            break;
        }

        // Set next startTime to the openTime of the last candle + 1ms
        // This ensures we don't duplicate the last candle
        const lastCandle = batch[batch.length - 1];
        currentStartTime = lastCandle.openTime + 1;
        batchNumber++;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return allKlines;
}

/**
 * Main function
 */
async function main() {
    console.log('Starting BTCUSDC hourly candles fetch...');
    console.log(`Symbol: ${SYMBOL}`);
    console.log(`Interval: ${INTERVAL}`);
    console.log(`Start Date: ${START_DATE.toISOString()}`);
    console.log(`End Date: ${END_DATE.toISOString()}`);
    console.log(`Start Timestamp: ${START_DATE.getTime()}`);
    console.log(`End Timestamp: ${END_DATE.getTime()}\n`);

    const startTime = START_DATE.getTime();
    const endTime = END_DATE.getTime();

    try {
        const allKlines = await fetchAllKlines(SYMBOL, INTERVAL, startTime, endTime);

        console.log(`\n✅ Successfully fetched ${allKlines.length} candles`);

        // Sort by openTime to ensure chronological order
        allKlines.sort((a, b) => a.openTime - b.openTime);

        // Remove duplicates (in case of any overlap)
        const uniqueKlines = allKlines.filter((kline, index, self) => index === self.findIndex((k) => k.openTime === kline.openTime));

        console.log(`After deduplication: ${uniqueKlines.length} candles`);

        // Calculate date range of actual data
        if (uniqueKlines.length > 0) {
            const firstCandle = uniqueKlines[0];
            const lastCandle = uniqueKlines[uniqueKlines.length - 1];
            console.log(`\nActual data range:`);
            console.log(`  First candle: ${new Date(firstCandle.openTime).toISOString()}`);
            console.log(`  Last candle: ${new Date(lastCandle.openTime).toISOString()}`);
        }

        // Save to JSON file
        const outputPath = path.join(__dirname, 'market.json');
        const jsonData = JSON.stringify(uniqueKlines, null, 2);

        fs.writeFileSync(outputPath, jsonData, 'utf-8');
        console.log(`\n✅ Data saved to: ${outputPath}`);
        console.log(`File size: ${(jsonData.length / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
        console.error('\n❌ Error:', error);
        process.exit(1);
    }
}

// Run the script
main();
