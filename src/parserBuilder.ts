import { Parser, Input, Success, Fail } from './core';
import { WeakParserChainBuilder } from './weakParserChainBuilder';
import { ParserChainBuilder1, ParserChainBuilder2 } from './strongParserChainBuilder';

import {
    pegPairLeft, pegPairRight,
    sequence, choice, zeroMore, oneMore, optional, and, not,
    map, proxy,
    Pair, Many, ProxyParser,
} from "./operators";

export function startsWith<TI, TO>(parser: Parser<TI, TO>): ParserChainBuilder1<TI, TO> {
    return new WeakParserChainBuilder<TI>(parser) as ParserChainBuilder1<TI, TO>;
}

export function builder<TI, TO>(parser: Parser<TI, TO>): ParserBuilder<TI, TO> {
    return new ParserBuilderBase(parser);
}

export function either<TI, TO>(parser: Parser<TI, TO>): ParserBuilder<TI, TO> {
    return builder(parser);
}

export function anyNumberOf<TI, TO>(parser: Parser<TI, TO>): ManyParserBuilder<TI, TO> {
    return new ManyParserBuilderImp(zeroMore(parser));
}

export function atLeastOne<TI, TO>(parser: Parser<TI, TO>): ManyParserBuilder<TI, TO> {
    return new ManyParserBuilderImp(oneMore(parser));
}

export function maybe<TI, TO>(parser: Parser<TI, TO>): ParserBuilder<TI, TO | undefined> {
    return builder(optional(parser));
}

export function ifStarts<TI>(parser: Parser<TI, any>): PredicateParserBuilder<TI, any> {
    return new PredicateParserBuilderImp(and(parser));
}

export function ifNotStarts<TI>(parser: Parser<TI, any>): PredicateParserBuilder<TI, any> {
    return new PredicateParserBuilderImp(not(parser));
}

export function recursive<TI, TO>(): ProxyParserBuilder<TI, TO> {
    return new ProxyParserBuilderImp(proxy());
}

export const Parse = {
    startsWith,
    builder,
    either,
    anyNumberOf,
    atLeastOne,
    maybe,
    ifStarts,
    ifNotStarts,
    recursive,
};

export interface Constructor<T1, TR> {
    new (p1: T1) : TR;
}

export interface ParserBuilder<TI, TO> extends Parser<TI, TO> {
    readonly parser: Parser<TI, TO>;
    construct<TR>(con: Constructor<TO, TR>): ParserBuilder<TI, TR>;
    map<TR>(f: (v: TO) => TR): ParserBuilder<TI, TR>;
    or(option: Parser<TI, TO>): ParserBuilder<TI, TO>;
    followedBy<TR>(next: Parser<TI, TR>): ParserChainBuilder2<TI, TO, TR>;
    atLeastOne(): ManyParserBuilder<TI, TO>;
    anyNumber(): ManyParserBuilder<TI, TO>;
    maybe(): ParserBuilder<TI, TO | undefined>;
    not(): ParserBuilder<TI, undefined>;
}

export interface ManyParserBuilder<TI, TO> extends ParserBuilder<TI, Many<TO>> { // TODO: fix naming with 'G'?
    reduce(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO): ParserBuilder<TI, TO>;
    reduceG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U): ParserBuilder<TI, U>;
    reduceRight(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO): ParserBuilder<TI, TO>;
    reduceRightG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U): ParserBuilder<TI, U>;
}

export interface PredicateParserBuilder<TI, TO> extends ParserBuilder<TI, TO> {
    then<TR>(parser: Parser<TI, TR>): ParserBuilder<TI, TR>;
}

export interface ProxyParserBuilder<TI, TO> extends ParserBuilder<TI, TO> {
    set(parser: Parser<TI, TO>): void;
}

class ParserBuilderBase<TI, TO> implements ParserBuilder<TI, TO> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        return this.parser.parse(input);
    }

    construct<TR>(con: Constructor<TO, TR>) {
        return new ParserBuilderBase(map(this.parser, v => new con(v)));
    }

    map<TR>(f: (v: TO) => TR) {
        return new ParserBuilderBase(map(this.parser, f));
    }

    or(otherParser: Parser<TI, TO>) {
        return new ParserBuilderBase(choice<TI, TO>(this.parser, otherParser));
    }

    followedBy<TR>(next: Parser<TI, TR>): ParserChainBuilder2<TI, TO, TR> {
        return startsWith<TI, TO>(builder(this.parser)).followedBy(next);
    }

    atLeastOne() {
        return atLeastOne(this.parser);
    }

    anyNumber() {
        return anyNumberOf(this.parser);
    }

    maybe() {
        return maybe(this.parser);
    }

    not() {
        return ifNotStarts(this.parser);
    }

    toString() {
        return this.parser.toString();
    }
}

function adoptBuilder<TI, TO, TR>(parser: Parser<TI, TO>, f: (v: TO) => TR) {
    return builder(parser).map(f);
}

class ManyParserBuilderImp<TI, TO> extends ParserBuilderBase<TI, Many<TO>> implements ManyParserBuilder<TI, TO> {
    constructor(parser: Parser<TI, Many<TO>>) { super(parser); }

    reduce(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue: TO) {
        return adoptBuilder(this.parser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.parser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceRight(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue: TO) {
        return adoptBuilder(this.parser, rs => rs.reduceRight(callbackfn, initialValue));
    }

    reduceRightG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.parser, rs => rs.reduceRight(callbackfn, initialValue));
    }
}

class PredicateParserBuilderImp<TI, TO> extends ParserBuilderBase<TI, TO> implements PredicateParserBuilder<TI, TO> {
    constructor(parser: Parser<TI, TO>) { super(parser); }

    then<TR>(next: Parser<TI, TR>): ParserBuilder<TI, TR> {
        return this.followedBy(next).map((l, r) => r);
    }
}

class ProxyParserBuilderImp<TI, TO> extends ParserBuilderBase<TI, TO> implements ProxyParserBuilder<TI, TO> {
    constructor(parser: ProxyParser<TI, TO>) { super(parser); }

    set(parser: Parser<TI, TO>): void {
        (this.parser as ProxyParser<TI, TO>).set(parser);
    }
}
