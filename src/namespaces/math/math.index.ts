// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:math-index

import { abs } from './methods/abs';
import { acos } from './methods/acos';
import { asin } from './methods/asin';
import { atan } from './methods/atan';
import { avg } from './methods/avg';
import { ceil } from './methods/ceil';
import { cos } from './methods/cos';
import { exp } from './methods/exp';
import { floor } from './methods/floor';
import { ln } from './methods/ln';
import { log } from './methods/log';
import { log10 } from './methods/log10';
import { max } from './methods/max';
import { min } from './methods/min';
import { param } from './methods/param';
import { pow } from './methods/pow';
import { random } from './methods/random';
import { round } from './methods/round';
import { sin } from './methods/sin';
import { sqrt } from './methods/sqrt';
import { sum } from './methods/sum';
import { tan } from './methods/tan';
import { __eq } from './methods/__eq';

const methods = {
  abs,
  acos,
  asin,
  atan,
  avg,
  ceil,
  cos,
  exp,
  floor,
  ln,
  log,
  log10,
  max,
  min,
  param,
  pow,
  random,
  round,
  sin,
  sqrt,
  sum,
  tan,
  __eq
};

export class PineMath {
  private _cache = {};
  abs: ReturnType<typeof methods.abs>;
  acos: ReturnType<typeof methods.acos>;
  asin: ReturnType<typeof methods.asin>;
  atan: ReturnType<typeof methods.atan>;
  avg: ReturnType<typeof methods.avg>;
  ceil: ReturnType<typeof methods.ceil>;
  cos: ReturnType<typeof methods.cos>;
  exp: ReturnType<typeof methods.exp>;
  floor: ReturnType<typeof methods.floor>;
  ln: ReturnType<typeof methods.ln>;
  log: ReturnType<typeof methods.log>;
  log10: ReturnType<typeof methods.log10>;
  max: ReturnType<typeof methods.max>;
  min: ReturnType<typeof methods.min>;
  param: ReturnType<typeof methods.param>;
  pow: ReturnType<typeof methods.pow>;
  random: ReturnType<typeof methods.random>;
  round: ReturnType<typeof methods.round>;
  sin: ReturnType<typeof methods.sin>;
  sqrt: ReturnType<typeof methods.sqrt>;
  sum: ReturnType<typeof methods.sum>;
  tan: ReturnType<typeof methods.tan>;
  __eq: ReturnType<typeof methods.__eq>;

  constructor(private context: any) {
    // Install methods
    Object.entries(methods).forEach(([name, factory]) => {
      this[name] = factory(context);
    });
  }
}

export default PineMath;
