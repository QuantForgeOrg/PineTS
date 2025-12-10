//Pinescript formatted logs example:

import { Series } from '../Series';
import { Context } from '..';

export class Log {
    constructor(private context: Context) {}

    private logFormat(message: string, ...args: any[]) {
        return message.replace(/{(\d+)}/g, (match, index) => args[index]);
    }

    param(source: any, index: number = 0, name?: string) {
        return Series.from(source).get(index);
    }
    warning(message: string, ...args: any[]) {
        console.warn(this.logFormat(message, ...args));
    }
    error(message: string, ...args: any[]) {
        console.error(this.logFormat(message, ...args));
    }
    info(message: string, ...args: any[]) {
        console.log(this.logFormat(message, ...args));
    }
}
