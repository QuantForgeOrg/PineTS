//Pinescript formatted logs example:

import { Series } from '../Series';
import { Context } from '..';

export class Str {
    constructor(private context: Context) {}

    param(source: any, index: number = 0, name?: string) {
        return Series.from(source).get(index);
    }
    tostring(value: any) {
        return String(value);
    }
    tonumber(value: any) {
        return Number(value);
    }
    lower(value: string) {
        return String(value).toLowerCase();
    }
    upper(value: string) {
        return String(value).toUpperCase();
    }
    trim(value: string) {
        return String(value).trim();
    }
    repeat(source: string, repeat: number, separator: string = '') {
        return Array(repeat)
            .fill(source)
            .join(separator || '');
    }
    replace_all(source: string, target: string, replacement: string) {
        return String(source).replaceAll(target, replacement);
    }

    //occurense is the nth occurrence to replace
    replace(source: string, target: string, replacement: string, occurrence: number = 0) {
        const str = String(source);
        const tgt = String(target);
        const repl = String(replacement);
        const occ = Math.floor(Number(occurrence)) || 0;

        if (tgt === '') return str;

        let pos = 0;
        let found = 0;

        while (true) {
            const idx = str.indexOf(tgt, pos);
            if (idx === -1) return str;

            if (found === occ) {
                return str.substring(0, idx) + repl + str.substring(idx + tgt.length);
            }

            found++;
            pos = idx + tgt.length;
        }
    }

    contains(source: string, target: string) {
        return String(source).includes(target);
    }
    endswith(source: string, target: string) {
        return String(source).endsWith(target);
    }
    startswith(source: string, target: string) {
        return String(source).startsWith(target);
    }
    pos(source: string, target: string) {
        const idx = String(source).indexOf(target);
        return idx === -1 ? NaN : idx;
    }
    length(source: string) {
        return String(source).length;
    }
    match(source: string, pattern: string) {
        return String(source).match(new RegExp(pattern));
    }

    split(source: string, separator: string) {
        return [String(source).split(separator)]; //we need to double wrap the array in an array to match the PineTS expected output structure
    }
    substring(source: string, begin_pos: number, end_pos: number) {
        return String(source).substring(begin_pos, end_pos);
    }

    format(message: string, ...args: any[]) {
        return message.replace(/{(\d+)}/g, (match, index) => args[index]);
    }
}
