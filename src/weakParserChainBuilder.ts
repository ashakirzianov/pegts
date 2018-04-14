import { Parser } from './core';
import { ParserBuilder, builder } from './parserBuilder';
import { sequence, map, flatPegPair } from './operators';

export interface ConstructorAny {
    new(...params: any[]): any;
}

export class WeakParserChainBuilder<TI> {
    constructor(readonly parser: Parser<TI, any>, readonly parent: WeakParserChainBuilder<TI> | undefined = undefined) {}

    construct(con: ConstructorAny): ParserBuilder<TI, any> {
        return this.map((...params: any[]) => {
            return new (Function.prototype.bind.apply(con, [undefined].concat(params)));
        });
    }

    map(f: (...params: any[]) => any) {
        return builder(map(this.actualParser(), pairOrAny => f.apply(undefined, flatPegPair(pairOrAny))));
    }

    followedBy(otherParser: Parser<TI, any>) {
        return new WeakParserChainBuilder<TI>(otherParser, this);
    }

    toString() {
        return this.actualParser().toString();
    }

    protected actualParser(): Parser<TI, any> {
        return this.parent ? sequence(this.parent.actualParser(), this.parser) : this.parser;
    }
}
