import { Parser, Input, Success, Fail } from "./core";
import {
    sequence, choice, zeroMore, oneMore, optional,
    and, not,
    adopt,
    Pair, Many,
} from "./operators";
import { Constructor1 } from "./stronglytypedbuilder";

import { prefix } from "./string";

export { makeInput as stringInput } from "./string"
export { parse as startsWith } from "./stronglytypedbuilder";
export { parse as jsParse } from "./weaklytypedbuilder";
export {
    optional as maybe,
} from "./operators";

export function anyNumberOf<TI, TO>(parser: Parser<TI, TO>) {
    return new ManyParserBuilder(zeroMore(parser));
}

export function atLeastOne<TI, TO>(parser: Parser<TI, TO>) {
    return new ManyParserBuilder(oneMore(parser));
}

function builder<TI, TO>(parser: Parser<TI, TO>) {
    return new ParserBuilderBase(parser);
}

function adoptBuilder<TI, TO, TR>(parser: Parser<TI, TO>, f: (v: TO) => TR) {
    return builder(parser).adopt(f);
}

export class ParserBuilderBase<TI, TO> implements Parser<TI, TO> {
    constructor(readonly parser: Parser<TI, TO>) {}

    parse(input: Input<TI>) {
        return this.parser.parse(input);
    }

    produce<TR>(con: Constructor1<TO, TR>) {
        return new ParserBuilderBase(adopt(this.parser, v => new con(v)));
    }

    adopt<TR>(f: (v: TO) => TR) {
        return new ParserBuilderBase(adopt(this.parser, f));
    }

    // or(otherParser: Parser<TI, TO>) {
    //     return new ParserBuilderBase(choice(this.parser, otherParser));
    // }
}

// interface IManyParserBuilder<TI, T> {
//     reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): Parser<TI, T>;
//     reduceG<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): Parser<TI, U>;
//     reduceRight(callbackfn: (previousValue: T, currentValue: T, currentIndex: number, array: T[]) => T, initialValue?: T): Parser<TI, T>;
//     reduceRightG<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number, array: T[]) => U, initialValue: U): Parser<TI, U>;
// }

export class ManyParserBuilder<TI, TO> extends ParserBuilderBase<TI, Many<TO>> {
    constructor(parser: Parser<TI, Many<TO>>) { super(parser); }

    reduce(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO) {
        return adoptBuilder(this.parser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.parser, rs => rs.reduce(callbackfn, initialValue));
    }

    reduceRight(callbackfn: (previousValue: TO, currentValue: TO, currentIndex: number, array: TO[]) => TO, initialValue?: TO) {
        return adoptBuilder(this.parser, rs => rs.reduceRight(callbackfn, initialValue));
    }

    reduceRightG<U>(callbackfn: (previousValue: U, currentValue: TO, currentIndex: number, array: TO[]) => U, initialValue: U) {
        return adoptBuilder(this.parser, rs => rs.reduceRight(callbackfn, initialValue));
    }
}

export function either<TI, TO>(parser: Parser<TI, TO>) {
    return new EitherBuilder<TI, TO>(parser);
}

export class EitherBuilder<TI, TO> implements Parser<TI, TO> {
    readonly parser: Parser<TI, TO> = this.actualParser();

    constructor(private readonly currParser: Parser<TI, TO>, protected readonly parent: Parser<TI, TO> | undefined = undefined) {}

    parse(input: Input<TI>) {
        return this.actualParser().parse(input);
    }

    or(otherParser: Parser<TI, TO>) {
        return new EitherBuilder(otherParser, this);
    }

    private actualParser() {
        return this.parent ? choice(this.parent, this.currParser) : this.currParser;
    }
}

export function string(str: string) {
    return new EitherStringBuilder(str);
}

export class EitherStringBuilder implements Parser<string, string> {
    readonly parser: Parser<string, string> = this;

    constructor(readonly prefix: string, readonly parent: EitherStringBuilder | undefined = undefined) {}

    parse(input: Input<string>) {
        return this.actualParser().parse(input);
    }

    or(other: string) {
        return new EitherStringBuilder(other, this);
    }

    private actualParser(): Parser<string, string> {
        return this.parent ? choice<string, string>(this.parent.actualParser(), prefix(this.prefix)) : prefix(this.prefix);
    }
}

export function recursive<TO>() {
    return new RecursiveParser<string, TO>();
}

export class RecursiveParser<TI, TO> implements Parser<TI, TO> {
    private parser: Parser<TI, TO> | undefined = undefined;

    set(parser: Parser<TI, TO>) {
        this.parser = parser;
    }

    parse(input: Input<TI>) {
        return this.parser ? this.parser.parse(input) : new Fail(0);
    }
}
