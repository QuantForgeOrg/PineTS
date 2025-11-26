// SPDX-License-Identifier: AGPL-3.0-only

import { InputOptions } from '../types';

export function bool(context: any) {
    return (value: boolean, { title, group }: InputOptions = {}) => {
        return Array.isArray(value) ? value[0] : value;
    };
}

