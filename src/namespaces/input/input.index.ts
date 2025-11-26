// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:input-index

export type { InputOptions } from './types';

import { any } from './methods/any';
import { bool } from './methods/bool';
import { color } from './methods/color';
import { enum_fn } from './methods/enum';
import { float } from './methods/float';
import { int } from './methods/int';
import { param } from './methods/param';
import { price } from './methods/price';
import { session } from './methods/session';
import { source } from './methods/source';
import { string } from './methods/string';
import { symbol } from './methods/symbol';
import { text_area } from './methods/text_area';
import { time } from './methods/time';
import { timeframe } from './methods/timeframe';

const methods = {
  any,
  bool,
  color,
  enum: enum_fn,
  float,
  int,
  param,
  price,
  session,
  source,
  string,
  symbol,
  text_area,
  time,
  timeframe
};

//in the current implementation we just declare the input interfaces for compatibility
// in future versions this might be used for visualization
export class Input {
  any: ReturnType<typeof methods.any>;
  bool: ReturnType<typeof methods.bool>;
  color: ReturnType<typeof methods.color>;
  enum: ReturnType<typeof methods.enum>;
  float: ReturnType<typeof methods.float>;
  int: ReturnType<typeof methods.int>;
  param: ReturnType<typeof methods.param>;
  price: ReturnType<typeof methods.price>;
  session: ReturnType<typeof methods.session>;
  source: ReturnType<typeof methods.source>;
  string: ReturnType<typeof methods.string>;
  symbol: ReturnType<typeof methods.symbol>;
  text_area: ReturnType<typeof methods.text_area>;
  time: ReturnType<typeof methods.time>;
  timeframe: ReturnType<typeof methods.timeframe>;

  constructor(private context: any) {
    // Install methods
    Object.entries(methods).forEach(([name, factory]) => {
      this[name] = factory(context);
    });
  }
}

export default Input;
