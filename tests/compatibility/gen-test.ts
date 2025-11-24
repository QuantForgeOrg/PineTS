#!/usr/bin/env tsx

/**
 * Generate a test file and expected data from a .pine.ts indicator
 *
 * This script:
 * 1. Reads the indicator source code
 * 2. Runs it through expect-gen.ts to generate expected data
 * 3. Creates a .test.ts file that uses the expected data
 *
 * Usage as CLI:
 *   tsx gen-test.ts <indicator-path> <test-output-path>
 *
 * Usage as module:
 *   import { generateTest } from './gen-test.js';
 *   await generateTest(indicatorPath, testOutputPath);
 *
 * Example:
 *   tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateExpectedData } from './expect-gen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a test file and expected data from an indicator
 * @param indicatorPath Path to the .pine.ts indicator file (relative to compatibility folder)
 * @param testOutputPath Path where the .test.ts file should be written (relative to compatibility folder)
 */
export async function generateTest(indicatorPath: string, testOutputPath: string): Promise<void> {
    const resolvedIndicatorPath = path.resolve(__dirname, indicatorPath);
    const resolvedTestOutputPath = path.resolve(__dirname, testOutputPath);

    if (!fs.existsSync(resolvedIndicatorPath)) {
        throw new Error(`Indicator file not found: ${resolvedIndicatorPath}`);
    }

    // Read indicator code
    const indicatorCode = fs.readFileSync(resolvedIndicatorPath, 'utf-8');

    // Extract method name from test output path
    const methodName = path.basename(resolvedTestOutputPath, '.test.ts');

    // Determine namespace from path
    const namespaceMatch = resolvedTestOutputPath.match(/namespace[\/\\](\w+)/);
    const namespace = namespaceMatch ? namespaceMatch[1] : 'unknown';
    const namespaceUpper = namespace.toUpperCase();

    // Generate expected data file path (same directory as test file)
    const expectFilePath = resolvedTestOutputPath.replace('.test.ts', '.expect.json');

    // Generate expected data using imported function (much faster than spawning process)
    try {
        await generateExpectedData(indicatorCode, expectFilePath);
    } catch (error: any) {
        throw new Error(`Failed to generate expected data: ${error.message}`);
    }

    // Extract the indicator body (remove outer function wrapper and semicolon)
    const indicatorBody = indicatorCode
        .trim()
        .replace(/^\(context\)\s*=>\s*\{/, '') // Remove opening
        .replace(/\};?\s*$/, '') // Remove closing
        .trim();

    // Calculate relative path from test file to serializer
    const testDir = path.dirname(resolvedTestOutputPath);
    const serializerPath = path.relative(testDir, path.join(__dirname, 'lib', 'serializer.js'));
    const serializerImport = serializerPath.replace(/\\/g, '/');

    // Generate the test file
    const testTemplate = `import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { Provider } from '@pinets/marketData/Provider.class';
import { deserialize, deepEqual } from '${serializerImport}';

describe('${namespaceUpper} Namespace - ${methodName.toUpperCase()} Method', () => {
    it('should calculate ${methodName.toUpperCase()} correctly with native series and variable series', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

        const { result, plots } = await pineTS.run((context) => {
${indicatorBody
    .split('\n')
    .map((line) => '            ' + line)
    .join('\n')}
        });

        // Filter results for the date range 2025-10-01 to 2025-11-20
        const sDate = new Date('2025-10-01').getTime();
        const eDate = new Date('2025-11-20').getTime();

        const plotchar_data = plots['_plotchar'].data;
        const plot_data = plots['_plot'].data;

        // Extract results for the date range (same logic as expect-gen.ts)
        const filtered_results: any = {};
        let plotchar_data_str = '';
        let plot_data_str = '';

        if (plotchar_data.length != plot_data.length) {
            throw new Error('Plotchar and plot data lengths do not match');
        }

        for (let i = 0; i < plotchar_data.length; i++) {
            if (plotchar_data[i].time >= sDate && plotchar_data[i].time <= eDate) {
                plotchar_data_str += \`[\${plotchar_data[i].time}]: \${plotchar_data[i].value}\\n\`;
                plot_data_str += \`[\${plot_data[i].time}]: \${plot_data[i].value}\\n\`;
                for (let key in result) {
                    if (!filtered_results[key]) filtered_results[key] = [];
                    filtered_results[key].push(result[key][i]);
                }
            }
        }

        // Load expected data from JSON file using custom deserializer
        const expectFilePath = path.join(__dirname, '${methodName}.expect.json');
        const expectedData = deserialize(fs.readFileSync(expectFilePath, 'utf-8'));

        // Assert results using custom deep equality (handles NaN correctly)
        expect(deepEqual(filtered_results, expectedData.results)).toBe(true);
        expect(plotchar_data_str.trim()).toEqual(expectedData.plotchar_data);
        expect(plot_data_str.trim()).toEqual(expectedData.plot_data);
    });
});
`;

    // Write the test file
    fs.writeFileSync(resolvedTestOutputPath, testTemplate, 'utf-8');
}

// CLI usage
if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
    const args = process.argv.slice(2);

    if (args.length < 2) {
        console.error('Usage: tsx gen-test.ts <indicator-path> <test-output-path>');
        console.error('Example: tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts');
        process.exit(1);
    }

    const indicatorPath = args[0];
    const testOutputPath = args[1];

    try {
        await generateTest(indicatorPath, testOutputPath);
        console.log(`✓ Generated expected data: ${path.basename(testOutputPath.replace('.test.ts', '.expect.json'))}`);
        console.log(`✓ Generated test file: ${path.basename(testOutputPath)}`);
    } catch (error: any) {
        console.error(`✗ Error:`, error.message);
        process.exit(1);
    }
}
