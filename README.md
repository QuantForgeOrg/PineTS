[![npm version](https://img.shields.io/npm/v/pinets.svg?style=flat-square)](https://www.npmjs.com/package/pinets)
[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square)](https://opensource.org/licenses/AGPL-3.0)
[![Coverage](./.github/badges/coverage.svg)](./.github/badges/coverage.svg)
[![Documentation](https://img.shields.io/badge/docs-github--pages-blue?style=flat-square)](https://quantforgeorg.github.io/PineTS/)
[![Reddit](https://img.shields.io/reddit/subreddit-subscribers/QuantForge?style=flat-square&logo=reddit)](https://www.reddit.com/r/QuantForge/)

---

## Pine Script API Coverage

### Data

[![syminfo](./.github/badges/api-syminfo.svg)](./.github/badges/api-syminfo.svg)
[![session](./.github/badges/api-session.svg)](./.github/badges/api-session.svg)
[![timeframe](./.github/badges/api-timeframe.svg)](./.github/badges/api-timeframe.svg)
[![barstate](./.github/badges/api-barstate.svg)](./.github/badges/api-barstate.svg)
[![ticker](./.github/badges/api-ticker.svg)](./.github/badges/api-ticker.svg)
[![builtin](./.github/badges/api-builtin.svg)](./.github/badges/api-builtin.svg)

### Calculation

[![ta](./.github/badges/api-ta.svg)](./.github/badges/api-ta.svg)
[![math](./.github/badges/api-math.svg)](./.github/badges/api-math.svg)
[![array](./.github/badges/api-array.svg)](./.github/badges/api-array.svg)
[![map](./.github/badges/api-map.svg)](./.github/badges/api-map.svg)
[![matrix](./.github/badges/api-matrix.svg)](./.github/badges/api-matrix.svg)
[![request](./.github/badges/api-request.svg)](./.github/badges/api-request.svg)
[![types](./.github/badges/api-types.svg)](./.github/badges/api-types.svg)
[![strategy](./.github/badges/api-strategy.svg)](./.github/badges/api-strategy.svg)
[![input](./.github/badges/api-input.svg)](./.github/badges/api-input.svg)

### Drawing and Logging

[![str](./.github/badges/api-str.svg)](./.github/badges/api-str.svg)
[![color](./.github/badges/api-color.svg)](./.github/badges/api-color.svg)
[![chart](./.github/badges/api-chart.svg)](./.github/badges/api-chart.svg)
[![log](./.github/badges/api-log.svg)](./.github/badges/api-log.svg)
[![label](./.github/badges/api-label.svg)](./.github/badges/api-label.svg)
[![line](./.github/badges/api-line.svg)](./.github/badges/api-line.svg)
[![polyline](./.github/badges/api-polyline.svg)](./.github/badges/api-polyline.svg)
[![box](./.github/badges/api-box.svg)](./.github/badges/api-box.svg)
[![table](./.github/badges/api-table.svg)](./.github/badges/api-table.svg)
[![linefill](./.github/badges/api-linefill.svg)](./.github/badges/api-linefill.svg)

---

This project aims to provide a Javascript/Typescript port for Tradingview's Pine Script.
The current version does not run Pine Script directly, instead it runs a close Javascript equivalent called PineTS.

PineTS makes it possible to migrate Pine Script v5+ indicators to Javascript/Typescript, in order to run them in a Javascript environment.

## Disclaimer

PineTS is an independent project and is not affiliated with, endorsed by, or associated with TradingView or Pine Script™. All trademarks and registered trademarks mentioned belong to their respective owners.

## Overview

PineTS enables seamless conversion of Pine Script indicators to JavaScript/TypeScript code. It preserves the original functionality and behavior while providing robust handling of time-series data processing, technical analysis calculations, and Pine Script's distinctive scoping mechanisms.

## See it in action

Bellow are two ports of Pine Script indicators running in the browser.
PineTS is used to generate plot data, and tradingview light weight chart is used to display the plot.

-   [Williams Vix Fix](https://quantforgeorg.github.io/PineTS/indicators/willvixfix/)
-   [Squeeze Momentum](https://quantforgeorg.github.io/PineTS/indicators/sqzmom/)

## Key Features

-   **Pine Script Compatibility**: Supports Pine Script v5+ syntax and functionality
-   **High Precision**: Aims for the same precision as Pine Script (up to the 8th digit)
-   **Time-Series Processing**: Handles historical data and series operations
-   **Technical Analysis Functions**: Comprehensive set of TA indicators and calculations
-   **Mathematical Operations**: Advanced mathematical functions and precision handling
-   **Input Management**: Flexible parameter and input handling system
-   **Context Management**: Maintains proper scoping and variable access rules
-   **Runtime Transpilation**: Converts PineTS code to executable JavaScript at runtime

## Core Components

### PineTS Class

The main class that handles:

-   Market data management
-   Series calculations
-   Built-in variables (open, high, low, close, volume, etc.)
-   Runtime execution context

### Namespaces

-   **Core**: Essential Pine Script functionality and base operations
-   **TechnicalAnalysis**: Comprehensive set of technical indicators and analysis functions
-   **PineMath**: Mathematical operations and precision handling
-   **Input**: Parameter and input management system
-   **Syminfo**: Symbol information and market data helpers

## Installation

```bash
npm install pinets
```

## Usage Example

### Converting Pine Script to PineTS

Original Pine Script:

<table>
<tr>
<td>

```javascript
/*==[ Original Pine Script ]==*/

//@version=5
indicator('My EMA Cross Strategy');

ema9 = ta.ema(close, 9);
ema18 = ta.ema(close, 18);

bull_bias = ema9 > ema18;
bear_bias = ema9 < ema18;

prev_close = close[1];
diff_close = close - prev_close;

_oo = open;
_oo = math.abs(open[1] - close[2]);
```

</td>
<td>

```javascript
/*==[ Equivalent PineTS ]==*/

//
//'My EMA Cross Strategy';

let ema9 = ta.ema(close, 9);
let ema18 = ta.ema(close, 18);

let bull_bias = ema9 > ema18;
let bear_bias = ema9 < ema18;

let prev_close = close[1];
let diff_close = close - prev_close;

let _oo = open;
_oo = math.abs(open[1] - close[2]);
```

</td>
</tr>
</table>

### Running PineTS Code

```javascript
import { PineTS, Provider } from 'pinets';

// Initialize with market data
const pineTS = new PineTS(Provider.Binance, 'BTCUSDT', 'D', 100);

// Run your indicator
const { result } = await pineTS.run((context) => {
    const { ta, math } = context;
    const { close, open } = context.data;

    let ema9 = ta.ema(close, 9);
    let ema18 = ta.ema(close, 18);

    let bull_bias = ema9 > ema18;
    let bear_bias = ema9 < ema18;

    let prev_close = close[1];
    let diff_close = close - prev_close;

    let _oo = open;
    _oo = math.abs(open[1] - close[2]);

    return { ema9, ema18, bull_bias, bear_bias };
});
```

> **📖 For detailed documentation on initialization options, parameters, and advanced usage, see the [Initialization and Usage Guide](https://quantforgeorg.github.io/PineTS/initialization-and-usage/)**

## Key Differences from Pine Script

1. **Variable Declaration**: Use JavaScript's `const`, `let`, and `var` instead of Pine Script's implicit declaration
2. **Function Syntax**: JavaScript arrow functions and standard function syntax
3. **Module System**: Pine Script native types should be imported using syntax like : const ta = context.ta; const {close, open} = context.data;
4. **Scoping Rules**: Maintains Pine Script's series behavior through runtime transformation
5. **Return syntax**: PineTS can returns an object with the results of the indicator, allowing you to get the results of the indicator in a single call.

## Project Goals

PineTS aims for **full coverage** of Pine Script functions and capabilities. The ultimate goal is to enable running **original Pine Script code directly** without manual conversion to PineTS syntax.

-   Runtime Transpiler
-   Core Pine Script functions and variables
-   Series and scope management
-   Technical analysis functions
-   Mathematical functions
-   Input handling
-   Plots data handling
-   Market data connectors
-   Visualization add-ons
-   Strategy execution
-   Backtesting and simulation

## Technical Details

The library uses a runtime transpiler that:

1. Transforms PineTS code to handle time-series data
2. Manages variable scoping and context
3. Handles array indexing and series operations
4. Provides Pine Script-compatible function calls

## Contributing

Contributions are welcome! Please feel free to submit pull requests, create issues, or suggest improvements.

## License

This project is open-source and available under the AGPL License.

## Disclaimer

PineTS is an independent project and is not affiliated with, endorsed by, or associated with TradingView or Pine Script. All trademarks and registered trademarks mentioned belong to their respective owners.
