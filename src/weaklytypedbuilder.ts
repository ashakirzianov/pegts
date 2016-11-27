import { Parser } from "./core";
import { sequence, adopt, flatPegPair } from "./operators";

export function parse<TI>(parser: Parser<TI, any>) {
    return new ParserBuilder(parser);
}

export interface ConstructorAny {
    new(...params: any[]): any;
}

export class ParserBuilder<TI> {
    constructor(readonly parser: Parser<TI, any>, readonly parent: ParserBuilder<TI> | undefined = undefined) {}

    produce(con: ConstructorAny): Parser<TI, any> {
        return this.make((...params: any[]) => {
            return new (Function.prototype.bind.apply(con, [undefined].concat(params)));
        });
    }

    make(f: (...params: any[]) => any) {
        return adopt(this.actualParser(), pairOrAny => f.apply(undefined, flatPegPair(pairOrAny)));
    }

    followedBy(otherParser: Parser<TI, any>) {
        return new ParserBuilder<TI>(otherParser, this);
    }

    protected actualParser(): Parser<TI, any> {
        return this.parent ? sequence(this.parent.actualParser(), this.parser) : this.parser;
    }
}