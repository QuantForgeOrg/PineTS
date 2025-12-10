// SPDX-License-Identifier: AGPL-3.0-only
// This file is auto-generated. Do not edit manually.
// Run: npm run generate:map-index

export { PineMapObject } from './PineMapObject';

import { PineMapObject } from './PineMapObject';
import { new_fn } from './methods/new';
import { param } from './methods/param';

export class PineMap {
    [key: string]: any;

    constructor(private context: any) {

        // Install methods
    this.clear = (id: PineMapObject, ...args: any[]) => id.clear(...args);
    this.contains = (id: PineMapObject, ...args: any[]) => id.contains(...args);
    this.copy = (id: PineMapObject, ...args: any[]) => id.copy(...args);
    this.get = (id: PineMapObject, ...args: any[]) => id.get(...args);
    this.keys = (id: PineMapObject, ...args: any[]) => id.keys(...args);
    this.new = new_fn(context);
    this.param = param(context);
    this.put = (id: PineMapObject, ...args: any[]) => id.put(...args);
    this.put_all = (id: PineMapObject, ...args: any[]) => id.put_all(...args);
    this.remove = (id: PineMapObject, ...args: any[]) => id.remove(...args);
    this.size = (id: PineMapObject, ...args: any[]) => id.size(...args);
    this.values = (id: PineMapObject, ...args: any[]) => id.values(...args);
    }
}

export default PineMap;
