// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:array-index

export { PineArrayObject } from './PineArrayObject';

import { abs } from './methods/abs';
import { avg } from './methods/avg';
import { clear } from './methods/clear';
import { concat } from './methods/concat';
import { copy } from './methods/copy';
import { covariance } from './methods/covariance';
import { every } from './methods/every';
import { fill } from './methods/fill';
import { first } from './methods/first';
import { from } from './methods/from';
import { get } from './methods/get';
import { includes } from './methods/includes';
import { indexof } from './methods/indexof';
import { insert } from './methods/insert';
import { join } from './methods/join';
import { last } from './methods/last';
import { lastindexof } from './methods/lastindexof';
import { max } from './methods/max';
import { min } from './methods/min';
import { new_fn } from './methods/new';
import { new_bool } from './methods/new_bool';
import { new_float } from './methods/new_float';
import { new_int } from './methods/new_int';
import { new_string } from './methods/new_string';
import { param } from './methods/param';
import { pop } from './methods/pop';
import { push } from './methods/push';
import { range } from './methods/range';
import { remove } from './methods/remove';
import { reverse } from './methods/reverse';
import { set } from './methods/set';
import { shift } from './methods/shift';
import { size } from './methods/size';
import { slice } from './methods/slice';
import { some } from './methods/some';
import { sort } from './methods/sort';
import { sort_indices } from './methods/sort_indices';
import { standardize } from './methods/standardize';
import { stdev } from './methods/stdev';
import { sum } from './methods/sum';
import { unshift } from './methods/unshift';
import { variance } from './methods/variance';

const methods = {
  abs,
  avg,
  clear,
  concat,
  copy,
  covariance,
  every,
  fill,
  first,
  from,
  get,
  includes,
  indexof,
  insert,
  join,
  last,
  lastindexof,
  max,
  min,
  new: new_fn,
  new_bool,
  new_float,
  new_int,
  new_string,
  param,
  pop,
  push,
  range,
  remove,
  reverse,
  set,
  shift,
  size,
  slice,
  some,
  sort,
  sort_indices,
  standardize,
  stdev,
  sum,
  unshift,
  variance
};

export class PineArray {
  private _cache = {};
  abs: ReturnType<typeof methods.abs>;
  avg: ReturnType<typeof methods.avg>;
  clear: ReturnType<typeof methods.clear>;
  concat: ReturnType<typeof methods.concat>;
  copy: ReturnType<typeof methods.copy>;
  covariance: ReturnType<typeof methods.covariance>;
  every: ReturnType<typeof methods.every>;
  fill: ReturnType<typeof methods.fill>;
  first: ReturnType<typeof methods.first>;
  from: ReturnType<typeof methods.from>;
  get: ReturnType<typeof methods.get>;
  includes: ReturnType<typeof methods.includes>;
  indexof: ReturnType<typeof methods.indexof>;
  insert: ReturnType<typeof methods.insert>;
  join: ReturnType<typeof methods.join>;
  last: ReturnType<typeof methods.last>;
  lastindexof: ReturnType<typeof methods.lastindexof>;
  max: ReturnType<typeof methods.max>;
  min: ReturnType<typeof methods.min>;
  new: ReturnType<typeof methods.new>;
  new_bool: ReturnType<typeof methods.new_bool>;
  new_float: ReturnType<typeof methods.new_float>;
  new_int: ReturnType<typeof methods.new_int>;
  new_string: ReturnType<typeof methods.new_string>;
  param: ReturnType<typeof methods.param>;
  pop: ReturnType<typeof methods.pop>;
  push: ReturnType<typeof methods.push>;
  range: ReturnType<typeof methods.range>;
  remove: ReturnType<typeof methods.remove>;
  reverse: ReturnType<typeof methods.reverse>;
  set: ReturnType<typeof methods.set>;
  shift: ReturnType<typeof methods.shift>;
  size: ReturnType<typeof methods.size>;
  slice: ReturnType<typeof methods.slice>;
  some: ReturnType<typeof methods.some>;
  sort: ReturnType<typeof methods.sort>;
  sort_indices: ReturnType<typeof methods.sort_indices>;
  standardize: ReturnType<typeof methods.standardize>;
  stdev: ReturnType<typeof methods.stdev>;
  sum: ReturnType<typeof methods.sum>;
  unshift: ReturnType<typeof methods.unshift>;
  variance: ReturnType<typeof methods.variance>;

  constructor(private context: any) {
    // Install methods
    Object.entries(methods).forEach(([name, factory]) => {
      this[name] = factory(context);
    });
  }
}

export default PineArray;
