import { Parser } from "./Core";
import { ParserBuilder, builder } from "./ParserBuilder";
import { sequence, adopt, flatPegPair } from "./Operators";

export interface ConstructorAny {
    new(...params: any[]): any;
}

export class WeakParserChainBuilder<TI> {
    constructor(readonly parser: Parser<TI, any>, readonly parent: WeakParserChainBuilder<TI> | undefined = undefined) {}

    produce(con: ConstructorAny): ParserBuilder<TI, any> {
        return this.adopt((...params: any[]) => {
            return new (Function.prototype.bind.apply(con, [undefined].concat(params)));
        });
    }

    adopt(f: (...params: any[]) => any) {
        return builder(adopt(this.actualParser(), pairOrAny => f.apply(undefined, flatPegPair(pairOrAny))));
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
