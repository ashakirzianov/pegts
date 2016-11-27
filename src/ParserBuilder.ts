import { Parser, Input, Success, Fail } from "./Core";
import { WeakParserChainBuilder } from "./WeakParserChainBuilder";
import { ParserChainBuilder1, ParserChainBuilder2 } from "./StrongParserChainBuilder";

import {
    sequence, choice, zeroMore, oneMore,
    adopt,
    Pair, Many,
} from "./Operators";

export function startsWith<TI, TO>(parser: Parser<TI, TO>): ParserChainBuilder1<TI, TO> {
    return new WeakParserChainBuilder<TI>(parser) as ParserChainBuilder1<TI, TO>;
}

export function builder<TI, TO>(parser: Parser<TI, TO>): ParserBuilder<TI, TO> {
    return new ParserBuilderBase(parser);
}

export function anyNumberOf<TI, TO>(parser: Parser<TI, TO>) {
    return new ManyParserBuilderImp(zeroMore(parser));
}

export function atLeastOne<TI, TO>(parser: Parser<TI, TO>) {
    return new ManyParserBuilderImp(oneMore(parser));
}

export interface Constructor<T1, TR> {
    new (p1: T1) : TR;
}

export interface ParserBuilder<TI, TO> extends Parser<TI, TO> {
    parser(): Parser<TI, TO>;
    produce<TR>(con: Constructor<TO, TR>): ParserBuilder<TI, TR>;
    adopt<TR>(f: (v: TO) => TR): ParserBuilder<TI, TR>;
    or(option: Parser<TI, TO>): ParserBuilder<TI, TO>;
    followedBy<TR>(next: Parser<TI, TR>): ParserChainBuilder2<TI, TO, TR>;
}

export interface ManyParserBuilder<TI, TO> extends ParserBuilder<TI, Many<TO>> { // TODO: fix naming with 'G'?
    reduce(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO): ParserBuilder<TI, TO>;
    reduceG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U): ParserBuilder<TI, U>;
    reduceRight(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO): ParserBuilder<TI, TO>;
    reduceRightG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U): ParserBuilder<TI, U>;
}

class ParserBuilderBase<TI, TO> implements ParserBuilder<TI, TO> {
    constructor(readonly containedParser: Parser<TI, TO>) {}

    parser(): Parser<TI, TO> {
        return this.containedParser;
    }

    parse(input: Input<TI>) {
        return this.containedParser.parse(input);
    }

    produce<TR>(con: Constructor<TO, TR>) {
        return new ParserBuilderBase(adopt(this.containedParser, v => new con(v)));
    }

    adopt<TR>(f: (v: TO) => TR) {
        return new ParserBuilderBase(adopt(this.containedParser, f));
    }

    or(otherParser: Parser<TI, TO>) {
        return new ParserBuilderBase(choice<TI, TO>(this.containedParser, otherParser));
    }

    followedBy<TR>(next: Parser<TI, TR>): ParserChainBuilder2<TI, TO, TR> {
        return startsWith<TI, TO>(builder(this.containedParser)).followedBy(next);
    }
}

function adoptBuilder<TI, TO, TR>(parser: Parser<TI, TO>, f: (v: TO) => TR) {
    return builder(parser).adopt(f);
}

class ManyParserBuilderImp<TI, TO> extends ParserBuilderBase<TI, Many<TO>> implements ManyParserBuilder<TI, TO> {
    constructor(containedParser: Parser<TI, Many<TO>>) { super(containedParser); }

    reduce(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO) {
        return adoptBuilder(this.containedParser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.containedParser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceRight(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO) {
        return adoptBuilder(this.containedParser, rs => rs.reduceRight(callbackfn, initialValue));
    }

    reduceRightG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.containedParser, rs => rs.reduceRight(callbackfn, initialValue));
    }
}
