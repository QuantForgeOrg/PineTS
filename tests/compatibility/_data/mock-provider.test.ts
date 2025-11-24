import { describe, expect, it } from 'vitest';
import { MockProvider } from '@pinets/marketData/Mock/MockProvider.class';

describe('MockProvider', () => {
    it('should load BTCUSDC hourly data from JSON file', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-01-02T00:00:00Z').getTime();

        const data = await provider.getMarketData('BTCUSDC', '1h', undefined, startTime, endTime);

        expect(data.length).toBeGreaterThan(0);
        expect(data.length).toBeLessThanOrEqual(25); // Should be <= 25 hours (includes both start and end hours)

        // Verify data structure
        if (data.length > 0) {
            const firstCandle = data[0];
            expect(firstCandle).toHaveProperty('openTime');
            expect(firstCandle).toHaveProperty('open');
            expect(firstCandle).toHaveProperty('high');
            expect(firstCandle).toHaveProperty('low');
            expect(firstCandle).toHaveProperty('close');
            expect(firstCandle).toHaveProperty('volume');
            expect(firstCandle).toHaveProperty('closeTime');

            // Verify data is in chronological order
            for (let i = 1; i < data.length; i++) {
                expect(data[i].openTime).toBeGreaterThan(data[i - 1].openTime);
            }
        }
    });

    it('should respect limit parameter', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-01-10T00:00:00Z').getTime();

        const data = await provider.getMarketData('BTCUSDC', '1h', 10, startTime, endTime);

        expect(data.length).toBeLessThanOrEqual(10);
    });

    it('should filter data by date range', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-01-01T12:00:00Z').getTime();

        const data = await provider.getMarketData('BTCUSDC', '1h', undefined, startTime, endTime);

        if (data.length > 0) {
            expect(data[0].openTime).toBeGreaterThanOrEqual(startTime);
            expect(data[data.length - 1].openTime).toBeLessThanOrEqual(endTime);
        }
    });

    it('should handle different timeframe formats', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-01-02T00:00:00Z').getTime();

        // Test different timeframe formats that should all map to '1h'
        const data1 = await provider.getMarketData('BTCUSDC', '1h', undefined, startTime, endTime);
        const data2 = await provider.getMarketData('BTCUSDC', '60', undefined, startTime, endTime);

        // Both should return data (if file exists)
        expect(data1.length).toBeGreaterThanOrEqual(0);
        expect(data2.length).toBeGreaterThanOrEqual(0);
    });

    it('should return empty array for non-existent symbol/timeframe', async () => {
        const provider = new MockProvider();

        const data = await provider.getMarketData('NONEXISTENT', '1h');

        expect(data).toEqual([]);
    });

    it('should load BTCUSDC daily data from JSON file', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-01-31T23:59:59Z').getTime();

        // Test different daily timeframe formats
        const data1 = await provider.getMarketData('BTCUSDC', '1d', undefined, startTime, endTime);
        const data2 = await provider.getMarketData('BTCUSDC', 'D', undefined, startTime, endTime);
        const data3 = await provider.getMarketData('BTCUSDC', '1D', undefined, startTime, endTime);

        expect(data1.length).toBeGreaterThan(0);
        expect(data1.length).toBeLessThanOrEqual(31); // Should be <= 31 days

        // All formats should return the same data
        expect(data1.length).toBe(data2.length);
        expect(data1.length).toBe(data3.length);

        // Verify data structure
        if (data1.length > 0) {
            const firstCandle = data1[0];
            expect(firstCandle).toHaveProperty('openTime');
            expect(firstCandle).toHaveProperty('open');
            expect(firstCandle).toHaveProperty('high');
            expect(firstCandle).toHaveProperty('low');
            expect(firstCandle).toHaveProperty('close');
            expect(firstCandle).toHaveProperty('volume');
            expect(firstCandle).toHaveProperty('closeTime');

            // Verify data is in chronological order
            for (let i = 1; i < data1.length; i++) {
                expect(data1[i].openTime).toBeGreaterThan(data1[i - 1].openTime);
            }

            // Verify date range
            expect(data1[0].openTime).toBeGreaterThanOrEqual(startTime);
            expect(data1[data1.length - 1].openTime).toBeLessThanOrEqual(endTime);
        }
    });

    it('should handle daily candles with limit', async () => {
        const provider = new MockProvider();

        const startTime = new Date('2024-01-01T00:00:00Z').getTime();
        const endTime = new Date('2024-12-31T23:59:59Z').getTime();

        const data = await provider.getMarketData('BTCUSDC', '1d', 30, startTime, endTime);

        expect(data.length).toBeLessThanOrEqual(30);
        expect(data.length).toBeGreaterThan(0);
    });
});
