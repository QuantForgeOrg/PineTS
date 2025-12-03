---
layout: default
title: Technical Analysis
parent: API Coverage
---

## Technical Analysis

All functions listed below are verified to exist in Pine Script v5.

### Moving Averages

| Function      | Status | Description                              |
| ------------- | ------ | ---------------------------------------- |
| `ta.sma()`    | ✅     | Simple Moving Average                    |
| `ta.ema()`    | ✅     | Exponential Moving Average               |
| `ta.wma()`    | ✅     | Weighted Moving Average                  |
| `ta.hma()`    | ✅     | Hull Moving Average                      |
| `ta.rma()`    | ✅     | Rolling/Running Moving Average           |
| `ta.vwma()`   | ✅     | Volume Weighted Moving Average           |
| `ta.alma()`   | ✅     | Arnaud Legoux Moving Average             |
| `ta.linreg()` | ✅     | Linear Regression                        |
| `ta.swma()`   | ✅     | Symmetrically Weighted Moving Average    |
| `ta.vwap`     | ✅     | Volume Weighted Average Price (variable) |

### Oscillators & Momentum

| Function      | Status | Description                           |
| ------------- | ------ | ------------------------------------- |
| `ta.rsi()`    | ✅     | Relative Strength Index               |
| `ta.change()` | ✅     | Price Change                          |
| `ta.mom()`    | ✅     | Momentum                              |
| `ta.roc()`    | ✅     | Rate of Change                        |
| `ta.macd()`   | ✅     | Moving Average Convergence Divergence |
| `ta.stoch()`  | ✅     | Stochastic Oscillator                 |
| `ta.cci()`    | ✅     | Commodity Channel Index               |
| `ta.mfi()`    | ✅     | Money Flow Index                      |
| `ta.cmo()`    | ✅     | Chande Momentum Oscillator            |
| `ta.cog()`    | ✅     | Center of Gravity                     |
| `ta.tsi()`    | ✅     | True Strength Index                   |
| `ta.wpr()`    | ✅     | Williams %R                           |

### Volatility & Range

| Function        | Status | Description             |
| --------------- | ------ | ----------------------- |
| `ta.atr()`      | ✅     | Average True Range      |
| `ta.stdev()`    | ✅     | Standard Deviation      |
| `ta.variance()` | ✅     | Variance                |
| `ta.dev()`      | ✅     | Mean Absolute Deviation |
| `ta.tr`         | ✅     | True Range (variable)   |
| `ta.tr()`       | ✅     | True Range (function)   |
| `ta.bb()`       | ✅     | Bollinger Bands         |
| `ta.bbw()`      | ✅     | Bollinger Bands Width   |
| `ta.kc()`       | ✅     | Keltner Channels        |
| `ta.kcw()`      | ✅     | Keltner Channels Width  |
| `ta.range()`    | ✅     | Range                   |

### Trend Analysis

| Function          | Status | Description                        |
| ----------------- | ------ | ---------------------------------- |
| `ta.crossover()`  | ✅     | Crossover Detection                |
| `ta.crossunder()` | ✅     | Crossunder Detection               |
| `ta.cross()`      | ✅     | Cross Detection (either direction) |
| `ta.rising()`     | ✅     | Rising Trend Detection             |
| `ta.falling()`    | ✅     | Falling Trend Detection            |
| `ta.dmi()`        | ✅     | Directional Movement Index         |
| `ta.supertrend()` | ✅     | SuperTrend Indicator               |
| `ta.sar()`        | ✅     | Parabolic SAR                      |

### Volume Indicators

| Function     | Status | Description                                            |
| ------------ | ------ | ------------------------------------------------------ |
| `ta.obv`     | ✅     | On-Balance Volume (variable)                           |
| `ta.pvt`     | ✅     | Price-Volume Trend (variable)                          |
| `ta.wad`     | ✅     | Williams Accumulation/Distribution (variable)          |
| `ta.wvad`    | ✅     | Williams Variable Accumulation/Distribution (variable) |
| `ta.accdist` | ✅     | Accumulation/Distribution (variable)                   |
| `ta.nvi`     | ✅     | Negative Volume Index (variable)                       |
| `ta.pvi`     | ✅     | Positive Volume Index (variable)                       |
| `ta.iii`     | ✅     | Intraday Intensity Index (variable)                    |

### Statistical Functions

| Function                               | Status | Description               |
| -------------------------------------- | ------ | ------------------------- |
| `ta.highest()`                         | ✅     | Highest Value             |
| `ta.lowest()`                          | ✅     | Lowest Value              |
| `ta.median()`                          | ✅     | Median Value              |
| `ta.mode()`                            | ⬜     | Mode Value                |
| `ta.highestbars()`                     | ⬜     | Bars Since Highest        |
| `ta.lowestbars()`                      | ⬜     | Bars Since Lowest         |
| `ta.percentrank()`                     | ⬜     | Percentile Rank           |
| `ta.percentile_linear_interpolation()` | ⬜     | Percentile (Linear)       |
| `ta.percentile_nearest_rank()`         | ⬜     | Percentile (Nearest Rank) |
| `ta.correlation()`                     | ⬜     | Correlation Coefficient   |
| `ta.covariance()`                      | ⬜     | Covariance                |

### Support & Resistance

| Function         | Status | Description          |
| ---------------- | ------ | -------------------- |
| `ta.pivothigh()` | ✔️     | Pivot High Detection |
| `ta.pivotlow()`  | ✔️     | Pivot Low Detection  |

### Utility Functions

| Function         | Status | Description              |
| ---------------- | ------ | ------------------------ |
| `ta.valuewhen()` | ⬜     | Value When Condition Met |
| `ta.barssince()` | ⬜     | Bars Since Condition     |
| `ta.cum()`       | ✅     | Cumulative Sum           |

### Notes

-   Some indicators exist as both variables and functions (e.g., `ta.vwap`, `ta.tr`)
-   `ta.adx()` is **not** a standalone function in Pine Script v5 (it's part of `ta.dmi()`)
