// SPDX-License-Identifier: AGPL-3.0-only

import { InputOptions } from '../types';

export function source(context: any) {
    return (value: any, { title, group }: InputOptions = {}) => {
        return Array.isArray(value) ? value[0] : value;
    };
}

