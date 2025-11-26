// SPDX-License-Identifier: AGPL-3.0-only

import { InputOptions } from '../types';

export function string(context: any) {
    return (value: string, { title, group }: InputOptions = {}) => {
        return Array.isArray(value) ? value[0] : value;
    };
}

