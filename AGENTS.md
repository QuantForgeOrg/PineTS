# PineTS Technical Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Core Architecture](#core-architecture)
3. [The Transpiler Engine](#the-transpiler-engine)
4. [Series and Time-Series Processing](#series-and-time-series-processing)
5. [The param() Function System](#the-param-function-system)
6. [Unique ID Generation](#unique-id-generation)
7. [Context Management](#context-management)
8. [Namespace System](#namespace-system)
9. [Execution Flow](#execution-flow)
10. [Critical Implementation Details](#critical-implementation-details)
11. [Common Pitfalls and Best Practices](#common-pitfalls-and-best-practices)

---

## Project Overview

**PineTS** is a JavaScript/TypeScript library that enables the execution of Pine Script-like indicator code in a JavaScript environment. It is **not** a direct Pine Script interpreter, but rather a sophisticated runtime transpiler that converts PineTS code (which closely resembles Pine Script) into executable JavaScript that can process financial time-series data.

### Key Design Goals

1. **Pine Script Compatibility**: Mimic Pine Script v5+ behavior and semantics
2. **Time-Series Processing**: Handle historical data with proper lookback capabilities
3. **Runtime Transpilation**: Transform code at runtime without requiring pre-compilation
4. **Stateful Calculations**: Support incremental technical analysis calculations
5. **Caching & Performance**: Optimize repeated calculations through intelligent caching

---

## Core Architecture

PineTS follows a three-layer architecture:

```
┌─────────────────────────────────────────────────┐
│          User PineTS Code (Input)              │
│    (Looks like Pine Script, uses JS syntax)    │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│           Transpiler Layer                      │
│  • AST Parsing (acorn)                         │
│  • Scope Analysis                              │
│  • Code Transformation                         │
│  • Context Variable Management                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────┐
│         Runtime Execution Layer                 │
│  • Context Object ($)                          │
│  • Series Management                           │
│  • Namespace Functions (ta, math, etc.)       │
│  • State Management                            │
└─────────────────────────────────────────────────┘
```

### Main Components

1. **PineTS Class**: Orchestrates market data loading, execution, and pagination
2. **Context Class**: Maintains execution state, series data, and namespaces
3. **Transpiler**: Transforms PineTS code into executable JavaScript
4. **Namespaces**: Provide Pine Script functions (ta.ema, math.abs, etc.)

---

## The Transpiler Engine

The transpiler is the heart of PineTS. It transforms user code to handle Pine Script's unique scoping and time-series behavior.

### Transpilation Pipeline

```
Input Code String/Function
        ↓
┌───────────────────────┐
│  1. Parse to AST      │ (using acorn)
│     (ECMAScript AST)  │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│  2. Pre-Processing    │
│  • Transform nested   │
│    arrow functions    │
│  • Identify context-  │
│    bound variables    │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│  3. Analysis Pass     │
│  • Register functions │
│  • Track parameters   │
│  • Build scope tree   │
│  • Destructure arrays │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│  4. Transformation    │
│  • Variable scoping   │
│  • Series wrapping    │
│  • param() injection  │
│  • ID generation      │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│  5. Post-Processing   │
│  • Transform == to    │
│    $.math.__eq()      │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│  6. Code Generation   │ (using astring)
│     (Final JS code)   │
└───────────────────────┘
```

### Context Variable System

One of the most critical transformations is converting all user variables to use a **context object** (represented as `$`).

**Original User Code:**

```javascript
let ema9 = ta.ema(close, 9);
```

**Transpiled Code:**

```javascript
$.let.glb1_ema9 = $.init($.let.glb1_ema9, ta.ema(ta.param(close, undefined, 'p0'), ta.param(9, undefined, 'p1'), '_ta0'));
```

#### Why This Transformation?

1. **State Persistence**: Variables need to maintain their history across iterations
2. **Series Behavior**: Every variable becomes a time-series array
3. **Scope Isolation**: Prevents naming conflicts across different scopes
4. **Lookback Support**: Enables `variable[1]` to access previous values

### Scope Management

The transpiler maintains a sophisticated scope tree. Each variable is renamed with a prefix indicating its scope:

-   `glb1_` - Global scope (first occurrence)
-   `fn2_` - Function scope (second function)
-   `if3_` - If statement scope (third if block)
-   `for1_` - For loop scope

**Example:**

```javascript
// Original
let x = 10;
if (condition) {
    let x = 20; // Different x
}

// Transpiled
$.let.glb1_x = $.init($.let.glb1_x, 10);
if (condition) {
    $.let.if1_x = $.init($.let.if1_x, 20);
}
```

This prevents scope collisions and ensures each variable is tracked independently.

---

## Series and Time-Series Processing

### The Reverse Order Paradigm

**Critical Concept**: In PineTS, all series data is stored and accessed in **reverse chronological order**.

```
Pine Script Perspective (Natural Order):
[Bar 0, Bar 1, Bar 2, Bar 3, ..., Bar N]
   ↑
  Current bar

PineTS Internal Storage (Reverse Order):
[Bar N, Bar N-1, ..., Bar 2, Bar 1, Bar 0]
   ↑
  Index 0 = Most Recent = Current Bar
```

#### Why Reverse Order?

1. **Pine Script Compatibility**: In Pine Script, `close[0]` is the current bar, `close[1]` is the previous bar
2. **Efficient Access**: Current bar is always at index 0
3. **Natural Lookback**: `array[n]` naturally accesses n bars ago
4. **Memory Management**: Easy to shift values as new bars arrive

### Series Initialization with $.init()

Every variable assignment goes through the `$.init()` function:

```javascript
$.init(targetArray, sourceValue, lookbackIndex?)
```

**Purpose:**

-   Creates a time-series array if it doesn't exist
-   Sets the current value (index 0) from the source
-   Handles lookback operations when index is provided
-   Returns the array for chaining

**Implementation Logic:**

1. If target is undefined, create new array with value at index 0
2. If target exists, update index 0 with new value
3. If source is an array and index is provided, handle lookback
4. Apply precision formatting (10 decimals by default)

**Example Transformation:**

```javascript
// User writes:
let sma20 = ta.sma(close, 20);

// Transpiler generates:
$.let.glb1_sma20 = $.init($.let.glb1_sma20, ta.sma(ta.param(close, undefined, 'p0'), ta.param(20, undefined, 'p1'), '_ta0'));
```

### Series Shifting

At the end of each iteration (each bar processed), all series are shifted:

```javascript
// For each variable in context
for (let key in $.let) {
    if (Array.isArray($.let[key])) {
        const val = $.let[key][0];
        $.let[key].unshift(val); // Duplicate current value to maintain history
    }
}
```

This creates the time-series behavior where `variable[1]` accesses the previous bar's value.

---

## The param() Function System

### What is param()?

The `param()` function is a **critical wrapper** that the transpiler automatically injects around all arguments passed to namespace functions.

**Purpose:**

1. **Normalize Arguments**: Convert both single values and series into a consistent series format
2. **Lookback Handling**: Properly handle array access expressions like `close[1]`
3. **Caching**: Enable efficient caching by providing unique identifiers
4. **Type Conversion**: Handle edge cases like `na` (NaN) conversion

### Namespace-Specific param() Functions

Each namespace (ta, math, array, etc.) has its **own** param function:

-   `ta.param()` - For technical analysis functions
-   `math.param()` - For mathematical operations
-   `array.param()` - For array operations
-   `$.param()` - For general context operations

**Why separate functions?**

-   Allows namespace-specific parameter handling
-   Enables different caching strategies per namespace
-   Provides better debugging and error tracing

### param() Signature

```javascript
param(source, index, uniqueId);
```

**Parameters:**

1. `source`: The value or array to wrap
2. `index`: Lookback index (e.g., 1 for `close[1]`)
3. `uniqueId`: Unique identifier for caching (e.g., 'p0', 'p1')

### param() Implementation

```javascript
param(source, index, name) {
    // Skip non-series types
    if (typeof source === 'string') return source;
    if (!Array.isArray(source) && typeof source === 'object') return source;

    // Initialize series array if needed
    if (!this.params[name]) this.params[name] = [];

    if (Array.isArray(source)) {
        if (index) {
            // Handle lookback: close[1] becomes close.slice(1)
            this.params[name] = source.slice(index);
            this.params[name].length = source.length;
            return this.params[name];
        }
        // No lookback: clone the array
        this.params[name] = source.slice(0);
        return this.params[name];
    } else {
        // Single value: wrap in array format
        this.params[name][0] = source;
        return this.params[name];
    }
}
```

### How Lookback Works

When you write `close[1]`, the transpiler transforms it to:

```javascript
ta.param(close, 1, 'p0');
```

Inside param():

```javascript
// close is [100, 99, 98, 97, ...]
// index is 1
// Result: [99, 98, 97, ...] (shifted by 1)
this.params[name] = source.slice(1);
```

This effectively creates a series that's "offset" by 1 bar, so accessing index 0 gives you the previous bar's value.

---

## Unique ID Generation

The transpiler generates **unique identifiers** for two purposes:

### 1. Parameter IDs (for param function)

**Counter**: `paramIdCounter`

**Format**: `'p0'`, `'p1'`, `'p2'`, ...

**Purpose**:

-   Uniquely identify each parameter passed to namespace functions
-   Enable caching of parameter transformations
-   Track parameter lineage for debugging

**Example:**

```javascript
ta.ema(close, 9);
// Becomes:
ta.ema(ta.param(close, undefined, 'p0'), ta.param(9, undefined, 'p1'), '_ta0');
```

### 2. TA Call IDs (for state management)

**Counter**: `taCallIdCounter`

**Format**: `'_ta0'`, `'_ta1'`, `'_ta2'`, ...

**Purpose**:

-   Uniquely identify each technical analysis function call
-   Enable separate state tracking for multiple calls to the same function
-   Critical for incremental calculations

**Why This Matters:**

Consider this code:

```javascript
let ema1 = ta.ema(close, 9);
let ema2 = ta.ema(close, 21);
let ema3 = ta.ema(close, 9); // Same parameters as ema1!
```

Without unique call IDs:

-   `ema1` and `ema3` would share the same state (both use period 9)
-   They would return identical values (wrong!)
-   State would be corrupted

With unique call IDs:

```javascript
let ema1 = ta.ema(close, 9, '_ta0'); // Own state
let ema2 = ta.ema(close, 21, '_ta1'); // Own state
let ema3 = ta.ema(close, 9, '_ta2'); // Own state
```

Each call maintains **independent state** even with identical parameters.

### 3. Cache IDs (for optimization)

**Counter**: `cacheIdCounter`

**Format**: `'cache_0'`, `'cache_1'`, ...

**Purpose**:

-   Cache complex calculations
-   Avoid redundant computations
-   Improve performance for expensive operations

---

## Context Management

The **Context** class is the runtime execution environment. It holds all state during indicator execution.

### Context Structure

```javascript
class Context {
    // Market data (reverse chronological order)
    data: {
        open: [], // Opening prices
        high: [], // High prices
        low: [], // Low prices
        close: [], // Closing prices
        volume: [], // Volume data
        hl2: [], // (high + low) / 2
        hlc3: [], // (high + low + close) / 3
        ohlc4: [], // (open + high + low + close) / 4
    };

    // User variables by declaration type
    const: {}; // Variables declared with const
    let: {}; // Variables declared with let
    var: {}; // Variables declared with var
    params: {}; // Parameter-wrapped series

    // Namespace instances
    ta: TechnicalAnalysis;
    math: PineMath;
    array: PineArray;
    input: Input;
    request: PineRequest;
    core: Core;

    // State management
    taState: {}; // TA function states (for incremental calculations)
    cache: {}; // General caching

    // Execution state
    idx: number; // Current iteration index
    result: any; // Accumulated results
    plots: {}; // Plot metadata
}
```

### Context Lifecycle

```
┌─────────────────────────┐
│  1. Context Creation    │
│  - Initialize namespaces│
│  - Set up data arrays   │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  2. Data Population     │
│  - Load market data     │
│  - Initialize series    │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  3. Iteration Loop      │◄───┐
│  For each bar:          │    │
│  - Update context.idx   │    │
│  - Unshift new data     │    │
│  - Execute transpiled   │    │
│    code                 │    │
│  - Collect results      │    │
│  - Shift all series     │────┘
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  4. Result Collection   │
│  - Aggregate outputs    │
│  - Return final context │
└─────────────────────────┘
```

### State Management for TA Functions

Technical analysis functions use `context.taState` to maintain incremental calculation state.

**Example: EMA State**

```javascript
context.taState['_ta0'] = {
    prevEma: 100.5, // Previous EMA value
    initSum: 950.2, // Sum for initialization
    initCount: 9, // Count for initialization
};
```

This enables **incremental calculations** instead of recalculating from scratch each bar.

---

## Namespace System

Namespaces organize related functionality (similar to Pine Script's namespaces).

### Namespace Structure

Each namespace:

1. Is instantiated with the Context
2. Has its own `param()` function
3. Implements Pine Script-compatible functions
4. May have its own caching/state management

### Common Namespaces

#### ta (Technical Analysis)

-   `ta.sma()` - Simple Moving Average
-   `ta.ema()` - Exponential Moving Average
-   `ta.rsi()` - Relative Strength Index
-   `ta.atr()` - Average True Range
-   ... many more

#### math (Mathematical Operations)

-   `math.abs()` - Absolute value
-   `math.max()` - Maximum
-   `math.min()` - Minimum
-   `math.avg()` - Average
-   `math.__eq()` - Special equality check (handles NaN)
-   ... many more

#### array (Array Operations)

-   `array.new()` - Create new array
-   `array.push()` - Add element
-   `array.get()` - Get element
-   ... many more

### Namespace Factory Pattern

All namespace functions use a factory pattern:

```javascript
// Export a factory function
export function ema(context: any) {
    // Return the actual function
    return (source: any, period: any, callId?: string) => {
        // Implementation
    };
}
```

**Why?**

-   Each function closure has access to the context
-   Functions can maintain state across calls
-   Supports dependency injection for testing

---

## Execution Flow

### Complete Execution Cycle

```
1. User calls: pineTS.run(code, periods)
   ↓
2. PineTS.ready() - Ensure market data loaded
   ↓
3. Initialize Context
   ↓
4. Transpile user code
   ↓
5. For each bar (iteration):
   ┌─────────────────────────────────┐
   │ a. Set context.idx              │
   │ b. Unshift new OHLCV data       │
   │    (data.close.unshift(value))  │
   │ c. Execute transpiled function  │
   │ d. Collect result               │
   │ e. Shift all user variables     │
   │    ($.let.var.unshift(val))     │
   └─────────────────────────────────┘
   ↓
6. Return final Context with results
```

### Data Flow During Iteration

```
Iteration N (Processing Bar N):

┌──────────────────────┐
│  Market Data Arrays  │
│  [N, N-1, N-2, ...]  │
└─────────┬────────────┘
          │ unshift()
          ▼
┌──────────────────────┐
│ Context.data.close   │
│ [Current, Prev, ...] │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Transpiled Code     │
│  Executes with       │
│  current data        │
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│  Variable Updates    │
│  $.let.var[0] = val  │
└─────────┬────────────┘
          │ unshift()
          ▼
┌──────────────────────┐
│  Series History      │
│  [Current, Prev, ...] │
└──────────────────────┘
```

### Pagination Mode

PineTS supports **pagination** for processing large datasets or live streaming:

```javascript
const generator = pineTS.run(code, periods, pageSize);

for await (const pageContext of generator) {
    // pageContext contains only NEW results for this page
    console.log(pageContext.result);
}
```

**Key Features:**

-   Processes data in chunks (pages)
-   Maintains state across pages
-   Supports live data streaming
-   Can recalculate last candle on updates

---

## Critical Implementation Details

### 1. The Double Shift Pattern

Variables maintain history through a "double shift" pattern:

```javascript
// After calculation
$.let.var[0] = newValue;

// At end of iteration
const val = $.let.var[0];
$.let.var.unshift(val); // Duplicate current to create history
```

Result:

```
Before: [current, prev1, prev2, ...]
After:  [current, current, prev1, prev2, ...]
                  ^
                  This becomes [1] (previous)
```

### 2. Equality Check Transformation

JavaScript's `==` and `===` don't properly handle NaN comparisons (critical in financial data).

**Transformation:**

```javascript
// User writes:
if (value == NaN) { ... }

// Transpiler converts to:
if ($.math.__eq(value, NaN)) { ... }
```

The `__eq()` function properly handles:

-   NaN comparisons (NaN == NaN → true in Pine Script)
-   Series comparisons
-   Type coercion edge cases

### 3. Array Pattern Destructuring

Destructuring requires special handling:

```javascript
// User writes:
let [a, b] = ta.supertrend(close, 10, 3);

// Transpiler creates:
let temp_1 = ta.supertrend(...);
let a = $.init($.let.glb1_a, temp_1?.[0][0]);
let b = $.init($.let.glb1_b, temp_1?.[0][1]);
```

### 4. Nested Function Parameters

Function parameters are marked as "context-bound" to prevent transformation:

```javascript
// User writes:
const myFunc = (value) => value * 2;

// Parameter 'value' is NOT transformed to $.let.value
// It remains as 'value' for proper function behavior
```

### 5. Loop Variable Handling

Loop variables receive special treatment:

```javascript
// User writes:
for (let i = 0; i < 10; i++) {
    sum += values[i];
}

// Loop variable 'i' is NOT transformed
// But 'sum' and 'values' ARE transformed
```

### 6. Precision Management

All numeric values are rounded to 10 decimal places (Pine Script standard):

```javascript
context.precision(value, decimals = 10) {
    if (typeof value !== 'number' || isNaN(value)) return value;
    return Number(value.toFixed(decimals));
}
```

---

## Common Pitfalls and Best Practices

### ⚠️ Pitfall 1: Forgetting About Reverse Order

**Problem:**

```javascript
// Thinking in forward order
let firstBar = close[0]; // Actually current bar, not first historical bar!
```

**Solution:**
Always remember: index 0 = current bar, higher indices = further back in time.

### ⚠️ Pitfall 2: Modifying Transpiler Without Understanding Scope

**Problem:**
Changing variable transformation logic can break scope isolation and cause variable collisions.

**Solution:**
Always test with the transpiler test suite. Understand the scope tree before modifying.

### ⚠️ Pitfall 3: Not Handling NaN Properly

**Problem:**

```javascript
if (value == NaN) { ... }  // Will never be true in JavaScript
```

**Solution:**
The transpiler automatically converts == to $.math.\_\_eq(), but if you manually create code, use the function explicitly.

### ⚠️ Pitfall 4: Sharing State Across Function Calls

**Problem:**

```javascript
// Two calls with same parameters sharing state
let ema1 = ta.ema(close, 9);
let ema2 = ta.ema(close, 9); // Should be independent!
```

**Solution:**
The transpiler automatically injects unique call IDs. Never manually remove them.

### ⚠️ Pitfall 5: Not Initializing Variables with $.init()

**Problem:**

```javascript
$.let.var = someValue; // Missing $.init(), won't work as series
```

**Solution:**
Always use `$.init()` for variable assignments (transpiler handles this automatically).

### ✅ Best Practice 1: Use the Transpiler

Never write transpiled code manually. Always let the transpiler handle transformations.

### ✅ Best Practice 2: Test with Multiple Scenarios

When modifying the transpiler, test with:

-   Simple variable assignments
-   Complex nested expressions
-   Multiple function calls with same parameters
-   Array operations
-   Conditional logic
-   Loops

### ✅ Best Practice 3: Understand the Context

Before debugging, understand what the context contains at each iteration:

-   What's in `$.let`, `$.const`, `$.var`?
-   What's in `$.params`?
-   What state is in `context.taState`?

### ✅ Best Practice 4: Respect the Scope Manager

The ScopeManager tracks:

-   Variable scopes and renaming
-   Context-bound variables
-   Loop variables
-   Array pattern elements
-   Parameter and cache ID generation

Don't bypass it or modify its state inconsistently.

### ✅ Best Practice 5: Incremental TA Functions

When implementing new TA functions, prefer incremental calculations over full recalculation:

```javascript
// ❌ Bad: Recalculate from scratch each time
function sma(source, period) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
        sum += source[i];
    }
    return sum / period;
}

// ✅ Good: Incremental with state
function sma(source, period, callId) {
    const state = context.taState[callId] || { window: [], sum: 0 };
    const current = source[0];

    state.window.unshift(current);
    state.sum += current;

    if (state.window.length > period) {
        state.sum -= state.window.pop();
    }

    return state.window.length >= period ? state.sum / period : NaN;
}
```

---

## Debugging Guide

### Viewing Transpiled Code

```javascript
const transformer = transpile.bind(context);
const transpiledFn = transformer(userCode);
console.log(transpiledFn.toString());
```

### Inspecting Context State

```javascript
console.log('Variables:', context.let);
console.log('Parameters:', context.params);
console.log('TA State:', context.taState);
console.log('Current Index:', context.idx);
```

### Common Debug Patterns

```javascript
// Check series values
console.log('close[0]:', context.data.close[0]); // Current
console.log('close[1]:', context.data.close[1]); // Previous

// Check variable history
console.log('ema9:', context.let.glb1_ema9); // Full series

// Check parameter transformations
console.log('Params:', context.params);
```

---

## Architecture Diagrams

### Overall Data Flow

```
┌──────────────┐
│ Market Data  │
│   Provider   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   PineTS     │──────┐
│    Class     │      │
└──────┬───────┘      │
       │              │
       ▼              ▼
┌──────────────┐ ┌──────────────┐
│  Transpiler  │ │   Context    │
└──────┬───────┘ └──────┬───────┘
       │                │
       └────────┬───────┘
                ▼
         ┌──────────────┐
         │  Execution   │
         │    Loop      │
         └──────┬───────┘
                ▼
         ┌──────────────┐
         │   Results    │
         └──────────────┘
```

### Transpiler Pass Flow

```
User Code
   ↓
Parse (acorn) → AST
   ↓
Pre-Process
   ↓
Analysis Pass → Scope Manager
   ↓           (Variable tracking,
Transformation  ID generation)
   ↓
Post-Process
   ↓
Generate (astring)
   ↓
Executable JS
```

---

## Summary of Key Concepts

| Concept           | Purpose                 | Critical Detail                        |
| ----------------- | ----------------------- | -------------------------------------- |
| **Reverse Order** | Series storage          | Index 0 = current, higher = older      |
| **$.init()**      | Variable initialization | Creates time-series arrays             |
| **param()**       | Argument wrapping       | Namespace-specific, handles lookback   |
| **Unique IDs**    | State isolation         | Separate state for each function call  |
| **Scope Manager** | Variable renaming       | Prevents collisions, tracks context    |
| **Context ($)**   | Runtime environment     | Holds all state and data               |
| **Double Shift**  | Series history          | Current value duplicated to create [1] |
| **Transpiler**    | Code transformation     | AST-based, multi-pass                  |

---

## Conclusion

PineTS is a sophisticated system that bridges Pine Script semantics with JavaScript execution. The key to understanding and maintaining it is recognizing:

1. **Everything is a series** - Variables, parameters, and data are all time-series arrays
2. **Reverse chronological order** - Current data is at index 0, past data at higher indices
3. **State isolation** - Unique IDs ensure independent state for each function call
4. **Context-driven execution** - The $ object is the central nervous system
5. **Incremental calculations** - TA functions maintain state for efficiency

When modifying PineTS:

-   Understand the transpilation pipeline
-   Respect the scope manager
-   Maintain the series paradigm
-   Test thoroughly with edge cases
-   Document any new transformations

This architecture enables running thousands of Pine Script indicators in JavaScript with high fidelity and performance.
