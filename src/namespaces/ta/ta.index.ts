// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:ta-index



import { accdist } from './methods/accdist';
import { alma } from './methods/alma';
import { atr } from './methods/atr';
import { bb } from './methods/bb';
import { bbw } from './methods/bbw';
import { cci } from './methods/cci';
import { change } from './methods/change';
import { cmo } from './methods/cmo';
import { cog } from './methods/cog';
import { cross } from './methods/cross';
import { crossover } from './methods/crossover';
import { crossunder } from './methods/crossunder';
import { cum } from './methods/cum';
import { dev } from './methods/dev';
import { dmi } from './methods/dmi';
import { ema } from './methods/ema';
import { falling } from './methods/falling';
import { highest } from './methods/highest';
import { hma } from './methods/hma';
import { iii } from './methods/iii';
import { kc } from './methods/kc';
import { kcw } from './methods/kcw';
import { linreg } from './methods/linreg';
import { lowest } from './methods/lowest';
import { macd } from './methods/macd';
import { median } from './methods/median';
import { mfi } from './methods/mfi';
import { mom } from './methods/mom';
import { nvi } from './methods/nvi';
import { obv } from './methods/obv';
import { param } from './methods/param';
import { pivothigh } from './methods/pivothigh';
import { pivotlow } from './methods/pivotlow';
import { pvi } from './methods/pvi';
import { pvt } from './methods/pvt';
import { range } from './methods/range';
import { rising } from './methods/rising';
import { rma } from './methods/rma';
import { roc } from './methods/roc';
import { rsi } from './methods/rsi';
import { sar } from './methods/sar';
import { sma } from './methods/sma';
import { stdev } from './methods/stdev';
import { stoch } from './methods/stoch';
import { supertrend } from './methods/supertrend';
import { swma } from './methods/swma';
import { tr } from './methods/tr';
import { tsi } from './methods/tsi';
import { variance } from './methods/variance';
import { vwap } from './methods/vwap';
import { vwma } from './methods/vwma';
import { wad } from './methods/wad';
import { wma } from './methods/wma';
import { wpr } from './methods/wpr';
import { wvad } from './methods/wvad';

const getters = {

};

const methods = {
  accdist,
  alma,
  atr,
  bb,
  bbw,
  cci,
  change,
  cmo,
  cog,
  cross,
  crossover,
  crossunder,
  cum,
  dev,
  dmi,
  ema,
  falling,
  highest,
  hma,
  iii,
  kc,
  kcw,
  linreg,
  lowest,
  macd,
  median,
  mfi,
  mom,
  nvi,
  obv,
  param,
  pivothigh,
  pivotlow,
  pvi,
  pvt,
  range,
  rising,
  rma,
  roc,
  rsi,
  sar,
  sma,
  stdev,
  stoch,
  supertrend,
  swma,
  tr,
  tsi,
  variance,
  vwap,
  vwma,
  wad,
  wma,
  wpr,
  wvad
};

export class TechnicalAnalysis {


  accdist: ReturnType<typeof methods.accdist>;
  alma: ReturnType<typeof methods.alma>;
  atr: ReturnType<typeof methods.atr>;
  bb: ReturnType<typeof methods.bb>;
  bbw: ReturnType<typeof methods.bbw>;
  cci: ReturnType<typeof methods.cci>;
  change: ReturnType<typeof methods.change>;
  cmo: ReturnType<typeof methods.cmo>;
  cog: ReturnType<typeof methods.cog>;
  cross: ReturnType<typeof methods.cross>;
  crossover: ReturnType<typeof methods.crossover>;
  crossunder: ReturnType<typeof methods.crossunder>;
  cum: ReturnType<typeof methods.cum>;
  dev: ReturnType<typeof methods.dev>;
  dmi: ReturnType<typeof methods.dmi>;
  ema: ReturnType<typeof methods.ema>;
  falling: ReturnType<typeof methods.falling>;
  highest: ReturnType<typeof methods.highest>;
  hma: ReturnType<typeof methods.hma>;
  iii: ReturnType<typeof methods.iii>;
  kc: ReturnType<typeof methods.kc>;
  kcw: ReturnType<typeof methods.kcw>;
  linreg: ReturnType<typeof methods.linreg>;
  lowest: ReturnType<typeof methods.lowest>;
  macd: ReturnType<typeof methods.macd>;
  median: ReturnType<typeof methods.median>;
  mfi: ReturnType<typeof methods.mfi>;
  mom: ReturnType<typeof methods.mom>;
  nvi: ReturnType<typeof methods.nvi>;
  obv: ReturnType<typeof methods.obv>;
  param: ReturnType<typeof methods.param>;
  pivothigh: ReturnType<typeof methods.pivothigh>;
  pivotlow: ReturnType<typeof methods.pivotlow>;
  pvi: ReturnType<typeof methods.pvi>;
  pvt: ReturnType<typeof methods.pvt>;
  range: ReturnType<typeof methods.range>;
  rising: ReturnType<typeof methods.rising>;
  rma: ReturnType<typeof methods.rma>;
  roc: ReturnType<typeof methods.roc>;
  rsi: ReturnType<typeof methods.rsi>;
  sar: ReturnType<typeof methods.sar>;
  sma: ReturnType<typeof methods.sma>;
  stdev: ReturnType<typeof methods.stdev>;
  stoch: ReturnType<typeof methods.stoch>;
  supertrend: ReturnType<typeof methods.supertrend>;
  swma: ReturnType<typeof methods.swma>;
  tr: ReturnType<typeof methods.tr>;
  tsi: ReturnType<typeof methods.tsi>;
  variance: ReturnType<typeof methods.variance>;
  vwap: ReturnType<typeof methods.vwap>;
  vwma: ReturnType<typeof methods.vwma>;
  wad: ReturnType<typeof methods.wad>;
  wma: ReturnType<typeof methods.wma>;
  wpr: ReturnType<typeof methods.wpr>;
  wvad: ReturnType<typeof methods.wvad>;

  constructor(private context: any) {
    // Install getters
    Object.entries(getters).forEach(([name, factory]) => {
      Object.defineProperty(this, name, {
        get: factory(context),
        enumerable: true
      });
    });
    
    // Install methods
    Object.entries(methods).forEach(([name, factory]) => {
      this[name] = factory(context);
    });
  }
}

export default TechnicalAnalysis;
