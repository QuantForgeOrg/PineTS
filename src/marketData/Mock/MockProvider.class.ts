// SPDX-License-Identifier: AGPL-3.0-only

import { IProvider } from '@pinets/marketData/IProvider';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    ignore: number | string;
}

/**
 * Mock Market Data Provider for Unit Tests
 *
 * This provider reads market data from pre-fetched JSON files instead of making API calls.
 * It's designed to be used in unit tests to provide consistent, offline test data.
 *
 * Usage:
 * ```typescript
 * const mockProvider = new MockProvider();
 * const data = await mockProvider.getMarketData('BTCUSDC', '1h', 100, startTime, endTime);
 * ```
 *
 * The provider looks for JSON files in the tests/compatibility/_data directory
 * with the naming pattern: {SYMBOL}-{TIMEFRAME}-{START_TIME}-{END_TIME}.json
 *
 * Example: BTCUSDC-1h-1704067200000-1763683199000.json
 */
export class MockProvider implements IProvider {
    private dataCache: Map<string, Kline[]> = new Map();
    private readonly dataDirectory: string;

    constructor(dataDirectory?: string) {
        // Default to tests/compatibility/_data directory
        // Calculate path relative to this file's location
        if (dataDirectory) {
            this.dataDirectory = dataDirectory;
        } else {
            // Navigate from src/marketData/Mock to tests/compatibility/_data
            const projectRoot = path.resolve(__dirname, '../../../');
            this.dataDirectory = path.join(projectRoot, 'tests', 'compatibility', '_data');
        }
    }

    /**
     * Generates a cache key for the data file
     */
    private getDataFileName(tickerId: string, timeframe: string, sDate?: number, eDate?: number): string | null {
        // If we have date range, try to find matching file
        if (sDate && eDate) {
            return `${tickerId}-${timeframe}-${sDate}-${eDate}.json`;
        }

        // Otherwise, try to find any file matching symbol and timeframe
        // This will require listing directory and finding best match
        return null;
    }

    /**
     * Loads data from JSON file
     */
    private loadDataFromFile(fileName: string): Kline[] {
        const cacheKey = `file:${fileName}`;

        // Check cache first
        if (this.dataCache.has(cacheKey)) {
            return this.dataCache.get(cacheKey)!;
        }

        const filePath = path.join(this.dataDirectory, fileName);

        if (!fs.existsSync(filePath)) {
            throw new Error(`Mock data file not found: ${filePath}`);
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data: Kline[] = JSON.parse(fileContent);

        // Cache the data
        this.dataCache.set(cacheKey, data);

        return data;
    }

    /**
     * Finds the best matching data file for the given parameters
     */
    private findDataFile(tickerId: string, timeframe: string, sDate?: number, eDate?: number): string | null {
        if (!fs.existsSync(this.dataDirectory)) {
            return null;
        }

        const files = fs.readdirSync(this.dataDirectory).filter((file) => file.endsWith('.json'));

        // If we have date range, try exact match first
        if (sDate && eDate) {
            const exactMatch = `${tickerId}-${timeframe}-${sDate}-${eDate}.json`;
            if (files.includes(exactMatch)) {
                return exactMatch;
            }
        }

        // Find files matching symbol and timeframe pattern
        const pattern = new RegExp(`^${tickerId}-${timeframe}-(\\d+)-(\\d+)\\.json$`);
        const matchingFiles = files
            .filter((file) => pattern.test(file))
            .map((file) => {
                const match = file.match(pattern)!;
                return {
                    file,
                    startTime: parseInt(match[1]),
                    endTime: parseInt(match[2]),
                };
            })
            .sort((a, b) => b.endTime - a.endTime); // Sort by endTime descending (most recent first)

        if (matchingFiles.length === 0) {
            return null;
        }

        // If we have date range, find file that contains it
        if (sDate && eDate) {
            const containingFile = matchingFiles.find((f) => f.startTime <= sDate && f.endTime >= eDate);
            if (containingFile) {
                return containingFile.file;
            }
        }

        // Return the most recent file (likely contains the data we need)
        return matchingFiles[0].file;
    }

    /**
     * Filters data based on date range and limit
     */
    private filterData(data: Kline[], sDate?: number, eDate?: number, limit?: number): Kline[] {
        let filtered = data;

        // Filter by date range
        if (sDate || eDate) {
            filtered = data.filter((kline) => {
                const matchesStart = !sDate || kline.openTime >= sDate;
                const matchesEnd = !eDate || kline.openTime <= eDate;
                return matchesStart && matchesEnd;
            });
        }

        // Sort by openTime to ensure chronological order
        filtered.sort((a, b) => a.openTime - b.openTime);

        // Apply limit
        if (limit && limit > 0) {
            filtered = filtered.slice(0, limit);
        }

        return filtered;
    }

    /**
     * Normalizes timeframe to match file naming convention
     */
    private normalizeTimeframe(timeframe: string): string {
        const timeframeMap: Record<string, string> = {
            '1': '1m',
            '3': '3m',
            '5': '5m',
            '15': '15m',
            '30': '30m',
            '60': '1h',
            '120': '2h',
            '240': '4h',
            '4H': '4h',
            '1D': '1d',
            D: '1d',
            '1W': '1w',
            W: '1w',
            '1M': '1M',
            M: '1M',
        };

        return timeframeMap[timeframe.toUpperCase()] || timeframe.toLowerCase();
    }

    /**
     * Implements IProvider.getMarketData
     *
     * @param tickerId - Symbol (e.g., 'BTCUSDC')
     * @param timeframe - Timeframe (e.g., '1h', '60', 'D')
     * @param limit - Optional limit on number of candles to return
     * @param sDate - Optional start date (timestamp in milliseconds)
     * @param eDate - Optional end date (timestamp in milliseconds)
     * @returns Promise<Kline[]> - Array of candle data
     */
    async getMarketData(tickerId: string, timeframe: string, limit?: number, sDate?: number, eDate?: number): Promise<Kline[]> {
        try {
            // Normalize timeframe
            const normalizedTimeframe = this.normalizeTimeframe(timeframe);

            // Find matching data file
            const dataFile = this.findDataFile(tickerId, normalizedTimeframe, sDate, eDate);

            if (!dataFile) {
                console.warn(`No mock data file found for ${tickerId} ${normalizedTimeframe}. ` + `Searched in: ${this.dataDirectory}`);
                return [];
            }

            // Load data from file
            const allData = this.loadDataFromFile(dataFile);

            // Filter and limit data
            const filteredData = this.filterData(allData, sDate, eDate, limit);

            return filteredData;
        } catch (error) {
            console.error(`Error in MockProvider.getMarketData:`, error);
            return [];
        }
    }

    /**
     * Clears the data cache
     */
    clearCache(): void {
        this.dataCache.clear();
    }

    /**
     * Sets a custom data directory
     */
    setDataDirectory(directory: string): void {
        (this as any).dataDirectory = directory;
        this.clearCache();
    }
}
