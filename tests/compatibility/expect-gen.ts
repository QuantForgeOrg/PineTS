#!/usr/bin/env tsx

/**
 * Generate expected test data by running an indicator
 *
 * This script:
 * 1. Takes indicator code as input (from file argument or stdin pipe)
 * 2. Runs it against mock market data
 * 3. Outputs expected results and plot data as JSON
 *
 * Usage as CLI:
 *   tsx expect-gen.ts <indicator-file> [output-json-file]
 *   cat indicator.ts | tsx expect-gen.ts - [output-json-file]
 *
 * Usage as module:
 *   import { generateExpectedData } from './expect-gen.js';
 *   const data = await generateExpectedData(indicatorCode, outputPath?);
 *
 * Examples:
 *   tsx expect-gen.ts indicator.ts output.json
 *   cat indicator.ts | tsx expect-gen.ts - output.json
 *   echo "(context) => ({ value: context.data.close[0] })" | tsx expect-gen.ts -
 */

import { PineTS } from '@pinets/index';
import { Provider } from '@pinets/marketData/Provider.class';
import * as fs from 'fs';
import * as path from 'path';
import { serialize } from './lib/serializer.js';

interface ExpectedData {
    results: string; // Serialized JSON string
    plotchar_data: string;
    plot_data: string;
}

/**
 * Generate expected data from indicator code
 * @param indicatorCode The indicator code as a string
 * @param outputPath Optional path to write the JSON file
 * @returns Expected data object
 */
export async function generateExpectedData(indicatorCode: string, outputPath?: string): Promise<ExpectedData> {
    // Initialize PineTS with mock data
    const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

    // Evaluate the indicator code to get a function
    let indicatorFunction: Function;
    try {
        // Clean up the code - remove trailing semicolons and whitespace
        const cleanCode = indicatorCode.trim().replace(/;+\s*$/, '');
        // Use Function constructor to evaluate the code
        // The code should be in format: (context) => { ... }
        indicatorFunction = eval(`(${cleanCode})`);
    } catch (error: any) {
        throw new Error(`Failed to parse indicator code: ${error.message}`);
    }

    // Run the indicator
    let result: any;
    let plots: any;
    try {
        const output = await pineTS.run(indicatorFunction);
        result = output.result;
        plots = output.plots;
    } catch (error: any) {
        throw new Error(`Failed to run indicator: ${error.message}`);
    }

    // Filter data for specific date range
    const sDate = new Date('2025-10-01').getTime();
    const eDate = new Date('2025-11-20').getTime();

    const plotchar_data = plots['_plotchar']?.data || [];
    const plot_data = plots['_plot']?.data || [];

    // Build filtered results
    const results: any = {};
    let plotchar_data_str = '';
    let plot_data_str = '';

    if (plotchar_data.length !== plot_data.length) {
        throw new Error('Plotchar and plot data lengths do not match');
    }

    for (let i = 0; i < plotchar_data.length; i++) {
        const ts = plotchar_data[i].time;
        if (ts >= sDate && ts <= eDate) {
            plotchar_data_str += `[${ts}]: ${plotchar_data[i].value}\n`;
            plot_data_str += `[${ts}]: ${plot_data[i].value}\n`;

            for (const key in result) {
                if (!results[key]) results[key] = [];
                results[key].push(result[key][i]);
            }
        }
    }

    const expectedData: ExpectedData = {
        results: serialize(results),
        plotchar_data: plotchar_data_str.trim(),
        plot_data: plot_data_str.trim(),
    };

    // Write to file if output path is provided
    if (outputPath) {
        const fullPath = path.resolve(outputPath);
        const jsonOutput = {
            results: JSON.parse(expectedData.results), // Parse serialized string for pretty JSON
            plotchar_data: expectedData.plotchar_data,
            plot_data: expectedData.plot_data,
        };
        fs.writeFileSync(fullPath, JSON.stringify(jsonOutput, null, 2), 'utf-8');
    }

    return expectedData;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    const args = process.argv.slice(2);

    if (args.length === 0) {
        console.error('Usage: tsx expect-gen.ts <indicator-file> [output-json-file]');
        console.error('   or: cat indicator.ts | tsx expect-gen.ts - [output-json-file]');
        console.error('');
        console.error('Examples:');
        console.error('  tsx expect-gen.ts indicator.ts');
        console.error('  tsx expect-gen.ts indicator.ts output.json');
        console.error('  cat indicator.ts | tsx expect-gen.ts -');
        console.error('  cat indicator.ts | tsx expect-gen.ts - output.json');
        process.exit(1);
    }

    const inputArg = args[0];
    const outputPath = args[1];

    let indicatorCode = '';

    try {
        if (inputArg === '-') {
            // Read from stdin
            indicatorCode = fs.readFileSync(0, 'utf-8');
        } else {
            // Read from file
            indicatorCode = fs.readFileSync(inputArg, 'utf-8');
        }

        const expectedData = await generateExpectedData(indicatorCode, outputPath);

        if (outputPath) {
            console.log(`Expected data written to: ${outputPath}`);
        } else {
            // Output to stdout
            const jsonOutput = {
                results: JSON.parse(expectedData.results),
                plotchar_data: expectedData.plotchar_data,
                plot_data: expectedData.plot_data,
            };
            console.log(JSON.stringify(jsonOutput, null, 2));
        }
    } catch (error: any) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}
