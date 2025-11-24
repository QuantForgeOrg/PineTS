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
import { generateTest } from './gen-test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure which namespace folders to check
const namespaceFolders = ['namespace/ta', 'namespace/math', 'namespace/array', 'misc'];

interface IndicatorInfo {
    indicatorPath: string;
    testPath: string;
    method: string;
    namespace: string;
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

            // Determine test path (replace /indicators/ with /)
            const testDir = indicatorsFolder.replace(/[\/\\]indicators$/, '');
            const testPath = path.join(testDir, `${method}.test.ts`);

            // Extract namespace from path
            const namespaceMatch = indicatorsFolder.match(/namespace[\/\\](\w+)/);
            const namespace = namespaceMatch ? namespaceMatch[1] : 'unknown';

            indicators.push({
                indicatorPath,
                testPath,
                method,
                namespace,
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

// Group by namespace for better output
const byNamespace: { [key: string]: IndicatorInfo[] } = {};
for (const indicator of allIndicators) {
    if (!byNamespace[indicator.namespace]) {
        byNamespace[indicator.namespace] = [];
    }
    byNamespace[indicator.namespace].push(indicator);
}

let successCount = 0;
let failCount = 0;

// Process each namespace
for (const [namespace, indicators] of Object.entries(byNamespace)) {
    console.log();
    console.log('='.repeat(70));
    console.log(`Processing ${namespace.toUpperCase()} Namespace (${indicators.length} methods)`);
    console.log('='.repeat(70));

    for (const indicator of indicators) {
        console.log();
        console.log(`[${successCount + failCount + 1}/${allIndicators.length}] ${indicator.method}`);

        try {
            await generateTest(indicator.indicatorPath, indicator.testPath);

            console.log(`  ✓ Generated successfully`);
            successCount++;
        } catch (error: any) {
            console.error(`  ✗ Failed:`, error.message);
            failCount++;
        }
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
    console.log('Run all tests with:');
    console.log('  npm test -- tests/compatibility/namespace');
}
