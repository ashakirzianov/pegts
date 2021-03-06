import { Parser, Input, Result, Success, Fail } from './core';

export type Pair<TOL, TOR> = { pegLeft: TOL, pegRight: TOR };
function pair<TOL, TOR>(left: TOL, right: TOR): Pair<TOL, TOR> {
    return {
        pegLeft: left,
        pegRight: right,
    };
}

export function pegPairLeft<TOL, TOR>(pair: Pair<TOL, TOR>): TOL {
    return pair.pegLeft;
}

export function pegPairRight<TOL, TOR>(pair: Pair<TOL, TOR>): TOR {
    return pair.pegRight;
}

export function flatPegPair(pairOrAny: any): any[] { // TODO: potential problems with name collisions
    return pairOrAny && (pairOrAny.pegLeft || pairOrAny.pegRight) ?
        flatPegPair(pairOrAny.pegLeft).concat(flatPegPair(pairOrAny.pegRight))
        : [pairOrAny];
}

export type Many<TO> = TO[];
function collection<TO>(outputs: TO[]): Many<TO> {
    return outputs;
}

export function sequence<TI, TOL, TOR>(left: Parser<TI, TOL>, right: Parser<TI, TOR>): Parser<TI, Pair<TOL, TOR>> {
    return new Sequence(left, right);
}

class Sequence<TI, TOL, TOR> implements Parser<TI, Pair<TOL, TOR>> {
    constructor(readonly left: Parser<TI, TOL>, readonly right: Parser<TI, TOR>) { }

    parse(input: Input<TI>): Result<TI, Pair<TOL, TOR>> {
        const lr = this.left.parse(input);
        if (lr.success) {
            const rr = this.right.parse(lr.next);
            return rr.success ?
                new Success(pair(lr.value, rr.value), rr.next, lr.lookAhead + rr.lookAhead)
                : new Fail(lr.lookAhead + rr.lookAhead);
        } else {
            return new Fail(lr.lookAhead);
        }
    }

    toString() {
        return `${this.left}${this.right}`;
    }
}

export function choice<TI, TO>(left: Parser<TI, TO>, right: Parser<TI, TO>): Parser<TI, TO> {
    return new Choice(left, right);
}

class Choice<TI, TO> implements Parser<TI, TO> {
    constructor(readonly left: Parser<TI, TO>, readonly right: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        const lr = this.left.parse(input);
        if (lr.success) {
            return lr;
        } else {
            const rr = this.right.parse(input);
            return rr.success ?
                rr.lookAhead >= lr.lookAhead ? rr : new Success(rr.value, rr.next, lr.lookAhead)
                : new Fail(rr.lookAhead >= lr.lookAhead ? rr.lookAhead : lr.lookAhead);
        }
    }

    toString() {
        return `${this.left}|${this.right}`;
    }
}

function parseZeroMore<TI, TO>(parser: Parser<TI, TO>, input: Input<TI>) {
    let result = new Array<TO>();
    let lookAhead = 0;
    let next = input;
    let curr = parser.parse(input);
    while (curr.success) {
        lookAhead += curr.lookAhead;
        next = curr.next;
        result.push(curr.value);
        curr = parser.parse(next);
    }
    lookAhead += curr.lookAhead;

    return new Success(collection(result), next, lookAhead);
}

export function zeroMore<TI, TO>(parser: Parser<TI, TO>): Parser<TI, Many<TO>> {
    return new ZeroMore(parser);
}

class ZeroMore<TI, TO> implements Parser<TI, Many<TO>> {
    constructor(readonly parser: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        return parseZeroMore(this.parser, input);
    }

    toString() {
        return `(${this.parser})*`;
    }
}

export function oneMore<TI, TO>(parser: Parser<TI, TO>): Parser<TI, Many<TO>> {
    return new OneMore(parser);
}

class OneMore<TI, TO> implements Parser<TI, Many<TO>> {
    constructor(readonly parser: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        const zeroMore = parseZeroMore(this.parser, input);
        return zeroMore.value.length > 0 ? zeroMore : new Fail(zeroMore.lookAhead);
    }

    toString() {
        return `(${this.parser})+`;
    }
}

export function optional<TI, TO>(parser: Parser<TI, TO>): Parser<TI, TO | undefined> {
    return new Optional(parser);
}

class Optional<TI, TO> implements Parser<TI, TO | undefined> {
    constructor(readonly parser: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? r : new Success(undefined, input, r.lookAhead);
    }

    toString() {
        return `(${this.parser})?`;
    }
}

export function and<TI, TO>(parser: Parser<TI, TO>): Parser<TI, TO> {
    return new AndPredicate(parser);
}

class AndPredicate<TI, TO> implements Parser<TI, TO> {
    constructor(readonly parser: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? new Success(r.value, input, r.lookAhead) : r;
    }

    toString() {
        return `if:${this.parser}`;
    }
}

export function not<TI, TO>(parser: Parser<TI, TO>): Parser<TI, Object> {
    return new NotPredicate(parser);
}

class NotPredicate<TI, TO> implements Parser<TI, Object> {
    constructor(readonly parser: Parser<TI, TO>) { }

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? new Fail(r.lookAhead) : new Success(new Object(), input, r.lookAhead);
    }

    toString() {
        return `not:${this.parser}`;
    }
}

export function map<TI, TO, TR>(parser: Parser<TI, TO>, f: (v: TO) => TR): Parser<TI, TR> {
    return new Map(parser, f);
}

class Map<TI, TO, TR> implements Parser<TI, TR> {
    constructor(readonly parser: Parser<TI, TO>, readonly f: (v: TO) => TR) { }

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? new Success(this.f(r.value), r.next, r.lookAhead) : new Fail(r.lookAhead);
    }

    toString() {
        return this.parser.toString();
    }
}

export function proxy<TI, TO>() {
    return new ProxyParser<TI, TO>();
}

export class ProxyParser<TI, TO> implements Parser<TI, TO> {
    private parser?: Parser<TI, TO> = undefined;

    set(parser: Parser<TI, TO>) {
        this.parser = parser;
    }

    parse(input: Input<TI>): Result<TI, TO> {
        return this.parser ? this.parser.parse(input) : new Fail(0);
    }

    toString() {
        return this.parser ? this.parser.toString() : "<null>";
    }
}
