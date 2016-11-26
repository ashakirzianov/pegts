import { Parser, Input } from "./core";
import {
    sequence, choice, zeroMore, oneMore, optional,
    and, not,
    produce,
    Pair, Many
} from "./operators"

export { prefix } from "./string";

export interface Constructor1<T1> {
    new (p1: T1) : any;
}

export interface Constructor2<T1, T2> {
    new (p1: T1, p2: T2) : any;
}

export interface Constructor3<T1, T2, T3> {
    new (p1: T1, p2: T2, p3: T3) : any;
}

export interface Constructor4<T1, T2, T3, T4> {
    new (p1: T1, p2: T2, p3: T3, p4: T4) : any;
}

export function parse<TI, TO>(parser: Parser<TI, TO>) {
    return new StartBuilder(parser);
}

class StartBuilder<TI, TO1> {
    constructor(readonly parser: Parser<TI, TO1>) {}

    produce<T extends Constructor1<TO1>>(con: T): Parser<TI, T> {
        return produce(this.parser, v => new con(v));       
    }

    then<TO2>(parser: Parser<TI, TO2>): Then1Builder<TI, TO1, TO2> {
        return new Then1Builder<TI, TO1, TO2>(parser, this);
    }

    actualParser() {
        return this.parser;
    }
}

export class Then1Builder<TI, TO1, TO2> {
    constructor(readonly parser: Parser<TI, TO2>, readonly parent: StartBuilder<TI, TO1>) {}

    produce<T extends Constructor2<TO1, TO2>>(con: T): Parser<TI, T> {
        return produce(
            this.actualParser(),
            v => new con(v.left, v.right));       
    }

    then<TO3>(parser: Parser<TI, TO3>) {
        return new Then2Builder<TI, TO1, TO2, TO3>(parser, this);
    }

    actualParser() {
        return sequence(this.parent.actualParser(), this.parser);
    }
}

export class Then2Builder<TI, TO1, TO2, TO3> {
    constructor(readonly parser: Parser<TI, TO3>, readonly parent: Then1Builder<TI, TO1, TO2>) {}

    produce<T extends Constructor3<TO1, TO2, TO3>>(con: T): Parser<TI, T> {
        return produce(
            this.actualParser(),
            v => new con(v.left.left, v.left.right, v.right));       
    }

    then<TO4>(parser: Parser<TI, TO4>) {
        return new Then3Builder<TI, TO1, TO2, TO3, TO4>(parser, this);
    }

    actualParser() {
        return sequence(this.parent.actualParser(), this.parser);
    }
}

export class Then3Builder<TI, TO1, TO2, TO3, TO4> {
    constructor(readonly parser: Parser<TI, TO4>, readonly parent: Then2Builder<TI, TO1, TO2, TO3>) {}

    produce<T extends Constructor4<TO1, TO2, TO3, TO4>>(con: T): Parser<TI, T> {
        return produce(
            this.actualParser(),
            v => new con(v.left.left.left, v.left.left.right, v.left.right, v.right));       
    }

    actualParser() {
        return sequence(this.parent.actualParser(), this.parser);
    }
}

export function either<TI, TO>(parser: Parser<TI, TO>) {
    return new EitherBuilder<TI, TO>(parser);
}

class EitherBuilder<TI, TO> implements Parser<TI, TO> {
    constructor(readonly parser: Parser<TI, TO>, readonly parent: Parser<TI, TO> | undefined = undefined) {}

    parse(input: Input<TI>) {
        return this.parser.parse(input);
    }

    or(otherParser: Parser<TI, TO>) {
        return new EitherBuilder(otherParser, this);
    }

    private actualParser() {
        return this.parent ? choice(this.parent, this.parser) : this.parser;
    }
}