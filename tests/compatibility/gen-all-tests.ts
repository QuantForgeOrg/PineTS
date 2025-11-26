#!/usr/bin/env tsx

/**
 * Generate all tests for namespaces that have indicators folders
 *
 * This script:
 * 1. Checks configured namespace folders
 * 2. Browses their subfolders for 'indicators' directories
 * 3. Generates tests for all .pine.ts files found
 *
 * Usage:
 *   tsx gen-all-tests.ts
 */

import * as path from 'path';
import { fileURLToPath } from 'url';
import * as fs from 'fs';
import { generateExpectedData } from './expect-gen.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure which namespace folders to check
const namespaceFolders = ['namespace/ta', 'namespace/math', 'namespace/array', 'misc'];

interface IndicatorInfo {
    indicatorPath: string;
    method: string;
    namespace: string;
    expectJsonPath: string;
    indicatorCode: string;
}

/**
 * Find all indicators folders recursively in a namespace folder
 */
function findIndicatorsFolders(namespaceFolder: string): string[] {
    const indicatorsFolders: string[] = [];
    const fullPath = path.join(__dirname, namespaceFolder);

    if (!fs.existsSync(fullPath)) {
        return indicatorsFolders;
    }

    function scanDirectory(dir: string) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            if (entry.isDirectory()) {
                const fullEntryPath = path.join(dir, entry.name);

                if (entry.name === 'indicators') {
                    // Found an indicators folder
                    const relativePath = path.relative(__dirname, fullEntryPath);
                    indicatorsFolders.push(relativePath);
                } else {
                    // Recursively scan subdirectories
                    scanDirectory(fullEntryPath);
                }
            }
        }
    }

    scanDirectory(fullPath);
    return indicatorsFolders;
}

/**
 * Get all .pine.ts files from an indicators folder
 */
function getIndicatorFiles(indicatorsFolder: string): IndicatorInfo[] {
    const indicators: IndicatorInfo[] = [];
    const fullPath = path.join(__dirname, indicatorsFolder);

    if (!fs.existsSync(fullPath)) {
        return indicators;
    }

    const files = fs.readdirSync(fullPath);

    for (const file of files) {
        if (file.endsWith('.pine.ts')) {
            const method = file.replace('.pine.ts', '');
            const indicatorPath = path.join(indicatorsFolder, file);

            // Determine data folder path (replace /indicators/ with /data/)
            const testDir = indicatorsFolder.replace(/[\/\\]indicators$/, '');
            const dataDir = path.join(testDir, 'data');
            const expectJsonPath = path.join(dataDir, `${method}.expect.json`);

            // Extract namespace from path
            // Try namespace/xxx pattern first, then fallback to misc or use folder name
            let namespace = 'unknown';
            const namespaceMatch = indicatorsFolder.match(/namespace[\/\\](\w+)/);
            if (namespaceMatch) {
                namespace = namespaceMatch[1];
            } else if (indicatorsFolder.includes('misc')) {
                namespace = 'misc';
            } else {
                // Use the parent folder name as namespace
                const parts = indicatorsFolder.split(/[\/\\]/);
                namespace = parts[parts.length - 2] || 'unknown';
            }

            // Read indicator code
            const indicatorCode = fs.readFileSync(path.join(__dirname, indicatorPath), 'utf-8');

            indicators.push({
                indicatorPath,
                method,
                namespace,
                expectJsonPath,
                indicatorCode,
            });
        }
    }

    return indicators;
}

console.log('='.repeat(70));
console.log('Generate All Tests - Namespace Compatibility Tests');
console.log('='.repeat(70));
console.log();

// Collect all indicators to process
const allIndicators: IndicatorInfo[] = [];

for (const namespaceFolder of namespaceFolders) {
    console.log(`Scanning ${namespaceFolder}...`);
    const indicatorsFolders = findIndicatorsFolders(namespaceFolder);

    if (indicatorsFolders.length === 0) {
        console.log(`  ⚠️  No indicators folders found`);
        continue;
    }

    for (const indicatorsFolder of indicatorsFolders) {
        const indicators = getIndicatorFiles(indicatorsFolder);
        console.log(`  ✓ Found ${indicators.length} indicators in ${indicatorsFolder}`);
        allIndicators.push(...indicators);
    }
}

console.log();
console.log('='.repeat(70));
console.log(`Total: ${allIndicators.length} indicators found`);
console.log('='.repeat(70));
console.log();

if (allIndicators.length === 0) {
    console.log('No indicators found. Exiting.');
    process.exit(0);
}

// Group by test directory (where the consolidated test file will be generated)
// This ensures indicators in the same directory are grouped together
const byTestDir: { [key: string]: IndicatorInfo[] } = {};
for (const indicator of allIndicators) {
    // Determine test directory (replace /indicators/ with /)
    const indicatorsFolder = path.dirname(indicator.indicatorPath);
    const testDir = indicatorsFolder.replace(/[\/\\]indicators$/, '');

    if (!byTestDir[testDir]) {
        byTestDir[testDir] = [];
    }
    byTestDir[testDir].push(indicator);
}

let successCount = 0;
let failCount = 0;

// Process all indicators - generate expect.json files
console.log();
console.log('='.repeat(70));
console.log('Generating Expected Data Files');
console.log('='.repeat(70));

for (const indicator of allIndicators) {
    console.log();
    console.log(`[${successCount + failCount + 1}/${allIndicators.length}] ${indicator.method}`);

    try {
        // Ensure data directory exists
        const dataDir = path.dirname(path.join(__dirname, indicator.expectJsonPath));
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Generate expect.json file
        const expectJsonFullPath = path.join(__dirname, indicator.expectJsonPath);
        await generateExpectedData(indicator.indicatorCode, expectJsonFullPath);

        console.log(`  ✓ Generated expect.json: ${indicator.expectJsonPath}`);
        successCount++;
    } catch (error: any) {
        console.error(`  ✗ Failed:`, error.message);
        failCount++;
    }
}

// Generate consolidated test files for each test directory
console.log();
console.log('='.repeat(70));
console.log('Generating Consolidated Test Files');
console.log('='.repeat(70));

for (const [testDir, indicators] of Object.entries(byTestDir)) {
    if (indicators.length === 0) continue;

    // Determine namespace from first indicator for display
    const namespace = indicators[0].namespace;
    const namespaceUpper = namespace.toUpperCase();

    console.log();
    console.log(`Generating test file for ${testDir} (${indicators.length} methods)...`);

    try {
        // Determine test file path (e.g., namespace/ta/methods/ta.test.ts)
        const testFilePath = path.join(testDir, `${namespace}.test.ts`);
        const resolvedTestPath = path.join(__dirname, testFilePath);

        // Ensure test directory exists
        const testDirFull = path.dirname(resolvedTestPath);
        if (!fs.existsSync(testDirFull)) {
            fs.mkdirSync(testDirFull, { recursive: true });
        }

        // Calculate relative path from test file to serializer
        const serializerPath = path.relative(testDirFull, path.join(__dirname, 'lib', 'serializer.js'));
        const serializerImport = serializerPath.replace(/\\/g, '/');

        // Generate consolidated test file
        const testCases = indicators.map((indicator) => {
            // Extract the indicator body (remove outer function wrapper and semicolon)
            const indicatorBody = indicator.indicatorCode
                .trim()
                .replace(/^\(context\)\s*=>\s*\{/, '')
                .replace(/\};?\s*$/, '')
                .trim();

            // Calculate relative path from test file to data folder
            const expectJsonRelativePath = path.relative(testDirFull, path.join(__dirname, indicator.expectJsonPath));
            const expectJsonImport = expectJsonRelativePath.replace(/\\/g, '/');

            return {
                method: indicator.method,
                indicatorBody,
                expectJsonPath: expectJsonImport,
            };
        });

        const testTemplate = `import { PineTS } from 'index';
import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import { Provider } from '@pinets/marketData/Provider.class';
import { deserialize, deepEqual } from '${serializerImport}';

describe('${namespaceUpper} Namespace', () => {
${testCases
    .map(
        (testCase) => `    it('${testCase.method.toUpperCase()} regression test', async () => {
        const pineTS = new PineTS(Provider.Mock, 'BTCUSDC', 'D', null, new Date('2025-01-01').getTime(), new Date('2025-11-20').getTime());

        const { result, plots } = await pineTS.run((context) => {
${testCase.indicatorBody
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
        const expectFilePath = path.join(__dirname, '${testCase.expectJsonPath}');
        const expectedData = deserialize(fs.readFileSync(expectFilePath, 'utf-8'));

        // Assert results using custom deep equality (handles NaN correctly)
        expect(deepEqual(filtered_results, expectedData.results)).toBe(true);
        expect(plotchar_data_str.trim()).toEqual(expectedData.plotchar_data);
        expect(plot_data_str.trim()).toEqual(expectedData.plot_data);
    });`
    )
    .join('\n\n')}
});
`;

        fs.writeFileSync(resolvedTestPath, testTemplate, 'utf-8');
        console.log(`  ✓ Generated: ${testFilePath}`);
    } catch (error: any) {
        console.error(`  ✗ Failed to generate test file:`, error.message);
        failCount++;
    }
}

console.log();
console.log('='.repeat(70));
console.log('Summary');
console.log('='.repeat(70));
console.log(`✓ Success: ${successCount}`);
console.log(`✗ Failed:  ${failCount}`);
console.log(`  Total:   ${allIndicators.length}`);
console.log('='.repeat(70));

if (failCount > 0) {
    console.log();
    console.log('⚠️  Some tests failed to generate. Please check the errors above.');
    process.exit(1);
} else {
    console.log();
    console.log('🎉 All tests generated successfully!');
    console.log();
    console.log('Test files are organized as follows:');
    console.log('  - expect.json files: namespace/*/methods/data/*.expect.json');
    console.log('  - consolidated test files: namespace/*/methods/*.test.ts');
    console.log();
    console.log('Run all tests with:');
    console.log('  npm test -- tests/compatibility/namespace');
}
