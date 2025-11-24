// SPDX-License-Identifier: AGPL-3.0-only

import { BinanceProvider } from './Binance/BinanceProvider.class';
import { MockProvider } from './Mock/MockProvider.class';

export const Provider = {
    Binance: new BinanceProvider(),
    Mock: new MockProvider(),
    //TODO : add other providers (polygon, etc.)
};
