import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { badgen } from 'badgen';
import path from 'path';

const badgesDir = '.github/badges';

/**
 * Generate test coverage badge
 */
function generateTestCoverageBadge() {
    const coveragePath = 'coverage/coverage-summary.json';
    const badgePath = path.join(badgesDir, 'coverage.svg');

    try {
        if (!existsSync(coveragePath)) {
            console.warn('Coverage summary not found. Skipping test coverage badge.');
            return;
        }

        const summary = JSON.parse(readFileSync(coveragePath, 'utf-8'));
        const total = Math.round(summary.total.lines.pct * 10) / 10;
        const color = total > 80 ? 'green' : total > 50 ? 'yellow' : 'red';

        const svgString = badgen({
            label: 'test coverage',
            status: `${total}%`,
            color: color,
            scale: 1,
        });

        writeFileSync(badgePath, svgString);
        console.log(`✓ Test coverage badge generated: ${total}%`);
    } catch (error) {
        console.error('Error generating test coverage badge:', error);
    }
}

/**
 * Count implemented features in a namespace JSON object
 */
function countImplemented(obj) {
    let implemented = 0;
    let total = 0;

    function traverse(item) {
        if (typeof item === 'boolean') {
            total++;
            if (item === true) implemented++;
        } else if (typeof item === 'object' && item !== null) {
            Object.values(item).forEach(traverse);
        }
    }

    traverse(obj);
    return { implemented, total };
}

/**
 * Generate API coverage badges for all namespaces
 */
function generateApiCoverageBadges() {
    const apiDir = 'docs/api-coverage/pinescript-v6';

    if (!existsSync(apiDir)) {
        console.warn('API coverage directory not found. Skipping API badges.');
        return;
    }

    const files = readdirSync(apiDir).filter((f) => f.endsWith('.json'));
    let totalImplemented = 0;
    let totalCount = 0;

    console.log('\n📊 API Coverage by Namespace:');
    console.log('─'.repeat(50));

    files.forEach((file) => {
        try {
            const namespace = path.basename(file, '.json');
            const filePath = path.join(apiDir, file);
            const data = JSON.parse(readFileSync(filePath, 'utf-8'));

            const { implemented, total } = countImplemented(data);
            const percentage = total > 0 ? Math.round((implemented / total) * 100) : 0;

            totalImplemented += implemented;
            totalCount += total;

            // Determine badge color
            const color = percentage >= 80 ? 'green' : percentage >= 50 ? 'blue' : percentage >= 30 ? 'yellow' : percentage > 0 ? 'orange' : 'red';

            // Generate badge
            const svgString = badgen({
                label: namespace,
                status: `${implemented}/${total} (${percentage}%)`,
                style: 'flat',
                color: color,
                scale: 1.2,
            });

            const badgePath = path.join(badgesDir, `api-${namespace}.svg`);
            writeFileSync(badgePath, svgString);

            console.log(`  ${namespace.padEnd(15)} ${implemented.toString().padStart(3)}/${total.toString().padEnd(3)} (${percentage}%)`);
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    });

    // Generate overall API coverage badge
    if (totalCount > 0) {
        const overallPercentage = Math.round((totalImplemented / totalCount) * 100);
        const color = overallPercentage >= 80 ? 'green' : overallPercentage >= 50 ? 'blue' : overallPercentage >= 30 ? 'yellow' : 'orange';

        const svgString = badgen({
            label: 'API coverage',
            status: `${overallPercentage}%`,
            style: 'flat',
            color: color,
            scale: 1,
        });

        const badgePath = path.join(badgesDir, 'api-coverage.svg');
        writeFileSync(badgePath, svgString);

        console.log('─'.repeat(50));
        console.log(`  ${'TOTAL'.padEnd(15)} ${totalImplemented.toString().padStart(3)}/${totalCount.toString().padEnd(3)} (${overallPercentage}%)`);
        console.log('\n✓ Overall API coverage badge generated');
    }
}

/**
 * Main function
 */
function main() {
    console.log('🎨 Generating badges...\n');

    // Ensure badges directory exists
    if (!existsSync(badgesDir)) {
        mkdirSync(badgesDir, { recursive: true });
    }

    // Generate both types of badges
    generateTestCoverageBadge();
    generateApiCoverageBadges();

    console.log('\n✅ Badge generation complete!\n');
}

// Run
try {
    main();
} catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
}
