import { Parser, Input, Result, Success, Fail } from "./core";

export type Pair<TOL, TOR> = { left: TOL, right: TOR };
function pair<TOL, TOR>(left: TOL, right: TOR): Pair<TOL, TOR> {
    return {
        left: left,
        right: right,
    };
}

export type Many<TO> = Array<TO>;
function collection<TO>(outputs: TO[]): Many<TO> {
    return outputs;
}

export class Seq<TI, TOL, TOR> implements Parser<TI, Pair<TOL, TOR>> {
    constructor(readonly left: Parser<TI, TOL>, readonly right: Parser<TI, TOR>) {}

    parse(input: Input<TI>) {
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
}

export class Choice<TI, TO> implements Parser<TI, TO> {
    constructor(readonly left: Parser<TI, TO>, readonly right: Parser<TI, TO>) {}

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

export class ZeroMore<TI, TO> implements Parser<TI, Many<TO>> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        return parseZeroMore(this.parser, input);
    }
}

export class OneMore<TI, TO> implements Parser<TI, Many<TO>> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        const zeroMore = parseZeroMore(this.parser, input);
        return zeroMore.value.length > 0 ? zeroMore : new Fail(zeroMore.lookAhead);
    }
}

export class Optional<TI, TO> implements Parser<TI, TO | undefined> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? r : new Success(undefined, input, r.lookAhead);
    }
}

export class AndPredicate<TI, TO> implements Parser<TI, TO> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ?
            new Success(r.value, input, r.lookAhead)
            : new Fail(r.lookAhead);
    }
}

export class NotPredicate<TI, TO> implements Parser<TI, undefined> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        const r = this.parser.parse(input);
        return r.success ? new Fail(r.lookAhead) : new Success(undefined, input, r.lookAhead);
    }
}