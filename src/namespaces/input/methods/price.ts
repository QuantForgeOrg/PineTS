// SPDX-License-Identifier: AGPL-3.0-only

import { InputOptions } from '../types';

export function price(context: any) {
    return (value: number, { title, group }: InputOptions = {}) => {
        return Array.isArray(value) ? value[0] : value;
    };
}

