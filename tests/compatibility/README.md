# Compatibility Tests for PineTS Namespace Methods

This directory contains **backward compatibility tests** for PineTS namespace methods. These tests ensure that changes to the core library or transpiler do not break existing functionality that worked in previous versions.

## Purpose & Philosophy

⚠️ **Important:** These tests are NOT for validating new method implementations. They serve a different purpose:

### What These Tests ARE For:
- ✅ **Backward Compatibility Guarantee** - Ensure future changes don't break existing functionality
- ✅ **Regression Detection** - Catch unintended side effects from core library or transpiler changes
- ✅ **Historical Baseline** - Preserve known-good behavior from previous versions
- ✅ **Refactoring Safety** - Confidently modify internals knowing tests will catch breaks

### What These Tests Are NOT For:
- ❌ **Validating New Methods** - New methods should be tested outside this system first
- ❌ **Correctness Verification** - These tests assume the baseline behavior is correct
- ❌ **Implementation Testing** - Use unit tests for implementation details

### Workflow:
1. **Develop & Test Externally** - Implement and validate your method with unit tests outside this system
2. **Generate Compatibility Tests** - Once validated, create a `.pine.ts` indicator and generate compatibility tests
3. **Lock In Behavior** - The generated `.expect.json` becomes the baseline for future versions
4. **Continuous Protection** - Any future changes that alter this behavior will fail these tests

**Example Scenario:**
```
1. You implement ta.sma() with thorough unit tests ✓
2. After confirming it works correctly, you generate compatibility tests
3. The compatibility tests capture the exact output for specific inputs
4. Later, someone refactors the transpiler
5. If the refactor changes ta.sma() behavior, tests fail → regression caught!
```

## Overview

The compatibility testing approach uses an **automated three-file pattern**:

-   **`indicators/{method}.pine.ts`** - Indicator source code (no comments!)
-   **`{method}.test.ts`** - Generated test file with assertions
-   **`{method}.expect.json`** - Generated expected results with special value preservation

Expected data is automatically generated using the `gen-test.ts` script, which:

1. Runs the indicator code against historical market data
2. Captures and serializes results (preserving NaN, Infinity, -Infinity, undefined)
3. Generates both the test file and expected data file

## File Structure

```
tests/compatibility/
├── gen-test.ts                         # Single test generator
├── gen-all-tests.ts                    # Batch test generator (all namespaces)
├── expect-gen.ts                       # Expected data generator (used by gen-test.ts)
├── lib/
│   └── serializer.ts                   # Custom NaN/Infinity serializer
└── namespace/
    ├── ta/
    │   └── methods/
    │       ├── indicators/
    │       │   └── sma.pine.ts        # Indicator source (NO COMMENTS!)
    │       ├── sma.test.ts            # Generated test file
    │       └── sma.expect.json        # Generated expected data
    ├── math/methods/...
    └── array/methods/...
```

## Quick Start: Generate a New Test

### 1. Create Indicator File

Create `namespace/{namespace}/methods/indicators/{method}.pine.ts` with your indicator code:

**⚠️ IMPORTANT: NO COMMENTS ALLOWED** - Comments break the transpiler!

```typescript
(context) => {
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const sma_native = ta.sma(close, 20);
    const src = close;
    const sma_var = ta.sma(src, 20);
    const sma_open = ta.sma(open, 10);

    plotchar(sma_native, '_plotchar');
    plot(sma_var, '_plot');

    return {
        sma_native,
        sma_var,
        sma_open,
    };
};
```

### 2. Generate Test and Expected Data

Run `gen-test.ts` from the `tests/compatibility` directory:

```bash
cd tests/compatibility
tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts
```

This will automatically:

-   ✅ Generate `sma.expect.json` with preserved NaN/Infinity values
-   ✅ Generate `sma.test.ts` with proper assertions
-   ✅ Use the custom serializer for special value handling

### 3. Run the Test

```bash
npm test -- tests/compatibility/namespace/ta/methods/sma.test.ts
```

## Complete Example: EMA Test

### Step 1: Create Indicator

File: `namespace/ta/methods/indicators/ema.pine.ts`

```typescript
(context) => {
    const { close, high } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;

    const ema_native = ta.ema(close, 9);
    const _close = close;
    const ema_var = ta.ema(_close, 21);
    const ema_high = ta.ema(high, 9);

    plotchar(ema_native, '_plotchar');
    plot(ema_var, '_plot');

    return {
        ema_native,
        ema_var,
        ema_high,
    };
};
```

### Step 2: Generate Test

```bash
cd tests/compatibility
tsx gen-test.ts namespace/ta/methods/indicators/ema.pine.ts namespace/ta/methods/ema.test.ts
```

Output:

```
Generating test for ema...
  Indicator: .../namespace/ta/methods/indicators/ema.pine.ts
  Test file: .../namespace/ta/methods/ema.test.ts
  Expected data: .../namespace/ta/methods/ema.expect.json

Step 1: Generating expected data...
✓ Expected data generated

Step 2: Analyzing indicator code...

Step 3: Generating test file...
✓ Test file generated

✓ Done! Test files generated successfully.
```

### Step 3: Run Test

```bash
npm test -- tests/compatibility/namespace/ta/methods/ema.test.ts
```

## Indicator Code Requirements

### ✅ Required Elements

1. **Arrow function format:**

    ```typescript
    (context) => { ... };
    ```

2. **NO COMMENTS** - Comments break the transpiler:

    ```typescript
    // ❌ BAD - Don't include any comments
    (context) => {
        // This will break!
        const sma = ta.sma(close, 20);
    };

    // ✅ GOOD - No comments
    (context) => {
        const sma = ta.sma(close, 20);
    };
    ```

3. **Extract context properties:**

    ```typescript
    const { close, open } = context.data;
    const ta = context.ta;
    const { plot, plotchar } = context.core;
    ```

4. **Always use `_plotchar` and `_plot`:**

    ```typescript
    plotchar(value1, '_plotchar');
    plot(value2, '_plot');
    ```

5. **Test multiple scenarios:**

    - Native series: `ta.sma(close, 20)`
    - Variable series: `const src = close; ta.sma(src, 20)`
    - Different parameters/sources: `ta.sma(open, 10)`

6. **Return object with all test values:**
    ```typescript
    return {
        sma_native,
        sma_var,
        sma_open,
    };
    ```

### ❌ Common Mistakes

```typescript
// ❌ Including comments
(context) => {
    // This comment will break transpilation
    const sma = ta.sma(close, 20);
};

// ❌ Missing semicolon at end
(context) => {
    return { value };
}; // Missing semicolon!

// ❌ Returning single values instead of series
return { value: ta.sma(close, 20)[0] }; // Wrong!

// ❌ Not using _plotchar and _plot
plotchar(value, 'myplot'); // Wrong name!
```

## How It Works

### 1. Custom Serializer (`lib/serializer.ts`)

The custom serializer preserves special numeric values that JSON doesn't support:

-   `NaN` → `"__NaN__"`
-   `Infinity` → `"__Infinity__"`
-   `-Infinity` → `"__-Infinity__"`
-   `undefined` → `"__undefined__"`

When tests load the `.expect.json` file, the deserializer converts these tokens back to their original values, enabling proper comparison.

### 2. Test Generator (`gen-test.ts`)

**Importable as Module or CLI Tool**

The generator can be used in two ways:

**As a Module (for `gen-all-tests.ts`):**
```typescript
import { generateTest } from './gen-test.js';
await generateTest(indicatorPath, testOutputPath);
```

**As CLI:**
```bash
tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts
```

The generator:

1. Reads your indicator source from `.pine.ts`
2. Calls `generateExpectedData()` from `expect-gen.ts` directly (no subprocess!)
3. Extracts the indicator body
4. Generates a test file that:
    - Imports the custom serializer
    - Runs the same indicator code
    - Uses `deepEqual()` for NaN-aware comparison
    - Asserts against deserialized expected data

### 3. Expected Data Generator (`expect-gen.ts`)

**Importable as Module or CLI Tool**

Can be used as:

**As a Module (for `gen-test.ts`):**
```typescript
import { generateExpectedData } from './expect-gen.js';
await generateExpectedData(indicatorCode, outputPath);
```

**As CLI (for manual testing):**
```bash
cat indicator.pine.ts | tsx expect-gen.ts - output.expect.json
```

Runs the indicator against:

-   **Provider:** Mock (pre-fetched BTCUSDC daily data)
-   **Data range:** 2025-01-01 to 2025-11-20
-   **Test range:** 2025-10-01 to 2025-11-20 (filtered)

Uses custom serializer to preserve all special values in the output JSON.

### 4. Performance Optimization

**Key optimization:** Both `gen-test.ts` and `expect-gen.ts` are importable modules, not just CLI tools. This means:

- `gen-all-tests.ts` imports `generateTest()` directly (no subprocess spawning)
- `gen-test.ts` imports `generateExpectedData()` directly (no subprocess spawning)
- **Result:** Generating all 64 tests takes **~30-40 seconds** instead of several minutes
- **Speed improvement:** ~3-4x faster by eliminating 128 subprocess spawns

## Regenerating Tests

If you need to update a test (e.g., after fixing a bug or changing test cases):

### Option 1: Regenerate Everything

```bash
cd tests/compatibility
tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts
```

This overwrites both `sma.test.ts` and `sma.expect.json`.

### Option 2: Regenerate Expected Data Only (CLI)

If you only want to update the expected data (keeping the test file as-is), you can use `expect-gen.ts` directly:

```bash
cat namespace/ta/methods/indicators/sma.pine.ts | tsx expect-gen.ts - namespace/ta/methods/sma.expect.json
```

**Note:** This is rarely needed since `gen-test.ts` is very fast now (uses direct function calls, not subprocesses).

## Troubleshooting

### Error: "$ is not defined"

**Cause:** Comments in your indicator file are confusing the transpiler.

**Solution:** Remove ALL comments from your `.pine.ts` file.

```typescript
// ❌ This will fail
(context) => {
    // Calculate SMA
    const sma = ta.sma(close, 20);
};

// ✅ This works
(context) => {
    const sma = ta.sma(close, 20);
};
```

### Error: "Cannot find module '../../lib/serializer.js'"

**Cause:** The test file was generated with incorrect relative path.

**Solution:** Regenerate the test using `gen-test.ts` (it calculates correct relative paths).

### Test Fails: Values Don't Match

**Cause:** The indicator implementation may have changed.

**Solution:** Regenerate the expected data:

```bash
cd tests/compatibility
tsx gen-test.ts namespace/ta/methods/indicators/{method}.pine.ts namespace/ta/methods/{method}.test.ts
```

### Test Fails: "Cannot read properties of undefined"

**Cause:** The indicator is trying to access data that doesn't exist (e.g., `context.data.close` before it's populated).

**Solution:** Ensure your indicator properly extracts context properties:

```typescript
const { close, open } = context.data; // ✅ Correct
const ta = context.ta; // ✅ Correct
```

## Best Practices

### 1. Indicator Organization

Store all indicator files in the `indicators/` subfolder:

```
namespace/ta/methods/
├── indicators/
│   ├── sma.pine.ts
│   ├── ema.pine.ts
│   └── rsi.pine.ts
├── sma.test.ts
├── sma.expect.json
├── ema.test.ts
└── ema.expect.json
```

### 2. Test Coverage

For each method, test:

-   ✅ Native series (direct from `context.data`)
-   ✅ Variable series (assigned to variable first)
-   ✅ Different parameters
-   ✅ Different source series
-   ✅ Edge cases (if applicable)

### 3. Naming Conventions

Use descriptive variable names that indicate what's being tested:

```typescript
const sma_native = ta.sma(close, 20); // Native series
const sma_var = ta.sma(src, 20); // Variable series
const sma_open = ta.sma(open, 10); // Different source
const sma_short = ta.sma(close, 5); // Different parameter
```

### 4. Version Control

✅ **DO commit:**

-   `.pine.ts` indicator files
-   `.test.ts` test files
-   `.expect.json` expected data files

❌ **DON'T commit:**

-   Temporary indicator files outside `indicators/` folder

### 5. Continuous Testing

After regenerating tests, always run them:

```bash
npm test -- tests/compatibility/namespace/ta/methods/{method}.test.ts
```

## Advanced Usage

### Generate All Tests at Once

Use `gen-all-tests.ts` to regenerate all compatibility tests across all namespaces:

```bash
cd tests/compatibility
tsx gen-all-tests.ts
```

**Performance:** Generates all 64 tests in approximately **30-40 seconds** using optimized module imports (no subprocess spawning).

This script:
1. Scans configured namespace folders (`namespace/ta`, `namespace/math`, `namespace/array`)
2. Finds all `indicators` subdirectories recursively
3. Imports and calls `generateTest()` for each `.pine.ts` file found
4. Much faster than spawning separate processes for each test
4. Provides detailed progress and summary

**Output:**
```
======================================================================
Generate All Tests - Namespace Compatibility Tests
======================================================================

Scanning namespace/ta...
  ✓ Found 22 indicators in namespace/ta/methods/indicators
Scanning namespace/math...
  ⚠️  No indicators folders found
Scanning namespace/array...
  ⚠️  No indicators folders found

======================================================================
Total: 22 indicators found
======================================================================

======================================================================
Processing TA Namespace (22 methods)
======================================================================

[1/22] sma
  ✓ Generated successfully
...

======================================================================
Summary
======================================================================
✓ Success: 22
✗ Failed:  0
  Total:   22
======================================================================

🎉 All tests generated successfully!
```

**When to use:**
- After major transpiler changes - regenerate all tests to establish new baseline
- After core library refactoring - verify no regressions
- When updating test framework - regenerate with new test structure

### Testing Multiple Namespaces

The `gen-test.ts` script automatically detects the namespace from the path:

```bash
# TA namespace
tsx gen-test.ts namespace/ta/methods/indicators/sma.pine.ts namespace/ta/methods/sma.test.ts

# Math namespace
tsx gen-test.ts namespace/math/methods/indicators/abs.pine.ts namespace/math/methods/abs.test.ts

# Array namespace
tsx gen-test.ts namespace/array/methods/indicators/sum.pine.ts namespace/array/methods/sum.test.ts
```

### Selective Batch Generation

Generate tests for specific methods only:

```bash
#!/bin/bash
# Generate tests for moving averages only
METHODS="sma ema rma wma vwma"
for method in $METHODS; do
    tsx gen-test.ts namespace/ta/methods/indicators/$method.pine.ts namespace/ta/methods/$method.test.ts
done
```

## Summary

### Purpose:
- 🛡️ **Backward Compatibility** - Guard against breaking changes
- 📊 **Regression Testing** - Catch unintended behavior changes
- 🔒 **Version Stability** - Ensure consistent behavior across versions
- ⚠️ **Not for Validation** - Use unit tests to validate new implementations first

### New Test Workflow:

1. ✅ Implement and validate method with unit tests (outside this system)
2. ✅ Create `.pine.ts` indicator file (NO COMMENTS!)
3. ✅ Run `gen-test.ts` (or `gen-all-tests.ts`) to generate compatibility tests
4. ✅ Run test to verify it passes - this becomes the baseline
5. ✅ Commit all three files (.pine.ts, .test.ts, .expect.json)
6. ✅ Future changes that break this baseline will fail the test

### Key Advantages:

-   🎯 **Automated** - One command generates everything
-   ⚡ **Fast** - Optimized module imports (~30-40s for all 64 tests)
-   🔒 **Type-safe** - Preserves NaN, Infinity, undefined correctly
-   🔄 **Reproducible** - Easy to regenerate when needed
-   📦 **Clean** - No manual copying of large data arrays
-   🧪 **Consistent** - All tests follow the same pattern
-   🛡️ **Protection** - Guards against regressions in core library and transpiler

### Key Rules:

1. **NO COMMENTS** in `.pine.ts` files
2. Always use `_plotchar` and `_plot`
3. Test multiple scenarios (native, variable, different params)
4. Run `gen-test.ts` from `tests/compatibility` directory
5. Commit all generated files to version control
6. **Only generate compatibility tests AFTER** validating method correctness elsewhere
