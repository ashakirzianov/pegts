import { Parser, Input, Success, Fail } from './core';
import { sequence, choice, zeroMore, oneMore, optional, not, and, adopt, pegPairLeft, pegPairRight } from './operators';
import { ParserBuilder, Constructor, builder, either as eitherGeneric } from './parserBuilder';

export type StringComparisonOptions = undefined | {
    readonly caseInsensitive?: boolean;
};

export function either<TO>(parser: Parser<string, TO>) {
    return eitherGeneric<string, TO>(parser);
}

export function charset(cs: string): StringParserBuilder {
    return  new StringParserBuilderImp(new CharSetParser(cs));
}

export function prefix(str: string, opts: StringComparisonOptions = undefined): Parser<string, string> {
    return new PrefixParser(str, opts);
}

export function reg(regexp: RegExp, lookAhead: number = 1): StringParserBuilder {
    return new StringParserBuilderImp(new RegexpParser(regexp, lookAhead));
}

export function anyChar(): StringParserBuilder {
    return new StringParserBuilderImp(new AnyCharParser());
}

export function str(str: string): StringParserBuilder {
    return new StringParserBuilderImp(prefix(str));
}

export function notStr(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(new NotPrefixParser(parser(sob)));
}

export function star(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(zeroMore(parser(sob)), ss => ss.reduce((a, s) => a + s, "")));
}

export function plus(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(oneMore(parser(sob)), ss => ss.reduce((a, s) => a + s, "")));
}

export function question(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(optional(parser(sob)), op => op || ""));
}

export function stringInput(str: string): Input<string> {
    return new StringInput(str);
}

export const Str = {
    either,
    charset,
    prefix,
    reg,
    anyChar,
    str,
    notStr,
    star,
    plus,
    question,
};

class StringInput implements Input<string> {
    constructor(readonly stream: string) {}

    bite(n: number) {
        return new StringInput(this.stream.substr(n));
    }
}

class RegexpParser implements Parser<string, string> {
    constructor(readonly regexp: RegExp, readonly lookAhead?: number) {}

    parse(input: Input<string>) {
        const match = input.stream.match(this.regexp);
        return match ?
            new Success(match[0], input.bite(match[0].length), match[0].length + 1) // TODO: weak
            : new Fail(this.lookAhead || 0); // TODO: even weaker
    }
}

class PrefixParser implements Parser<string, string> {
    readonly prefix: string;
    constructor(prefix: string, readonly opts: StringComparisonOptions = undefined) {
        this.prefix = this.opts && this.opts.caseInsensitive ? prefix.toLocaleLowerCase() : prefix;
    }

    parse(input: Input<string>) {
        return this.compare(input.stream) ?
            new Success(this.match(input.stream), input.bite(this.prefix.length), this.prefix.length)
            : new Fail(this.prefix.length);
    }

    toString() {
        return this.opts && this.opts.caseInsensitive ? `${this.prefix.toLocaleUpperCase()}` : `${this.prefix}`;
    }

    private compare(stream: string): boolean {
        return this.opts && this.opts.caseInsensitive ?
            stream.toLocaleLowerCase().lastIndexOf(this.prefix, 0) === 0
            : stream.lastIndexOf(this.prefix, 0) === 0;
    }

    private match(stream: string): string {
        return this.opts && this.opts.caseInsensitive ?
        stream.substr(0, this.prefix.length)
        : this.prefix;
    }
}

class CharSetParser implements Parser<string, string> {
    readonly regex: RegExp;
    constructor(readonly charset: string) {
        // TODO: check that valid charset
        this.regex = new RegExp(`^[${charset}]`);
    }

    parse(input: Input<string>) {
        return this.regex.test(input.stream) ?
            new Success(input.stream[0], input.bite(1), 1)
            : new Fail(1);
    }
}

class NotPrefixParser implements Parser<string, string> {
    constructor(readonly prefixParser: Parser<string, string>) {}

    parse(input: Input<string>) {
        const r = this.prefixParser.parse(input);
        return r.success ?
            new Fail(r.lookAhead)
            : new Success(input.stream.substr(0, r.lookAhead), input.bite(r.lookAhead), r.lookAhead);
    }

    toString() {
        return `~${this.prefixParser}`;
    }
}

class AnyCharParser implements Parser<string, string> {
    parse(input: Input<string>) {
        return input.stream.length > 0 ?
            new Success(input.stream[0], input.bite(1), 1)
            : new Fail(1);
    }

    toString() {
        return `.`;
    }
}

export type StringOrParser = string | Parser<string, string>;
function isParser(sob: StringOrParser): sob is Parser<string, string> {
    return typeof sob !== "string";
}
function parser(sob: StringOrParser): Parser<string, string> {
    return isParser(sob) ? sob : prefix(sob);
}

export interface StringParserBuilder extends Parser<string, string> {
    readonly parser: Parser<string, string>;
    generic(): ParserBuilder<string, string>;
    produce<TR>(con: Constructor<string, TR>): ParserBuilder<string, TR>;
    adopt<TR>(f: (v: string) => TR): ParserBuilder<string, TR>;
    or(other: StringOrParser): StringParserBuilder;
    followedBy(next: StringOrParser): StringParserBuilder;
    atLeastOne(): StringParserBuilder;
    anyNumber(): StringParserBuilder;
    maybe(): StringParserBuilder;
    not(): StringParserBuilder;
}

class StringParserBuilderImp implements Parser<string, string> {
    constructor(readonly parser: Parser<string, string>) {}

    generic() {
        return builder(this.parser);
    }

    produce<TR>(con: Constructor<string, TR>): ParserBuilder<string, TR> {
        return builder(this.parser).produce(con);
    }

    adopt<TR>(f: (v: string) => TR): ParserBuilder<string, TR> {
        return builder(this.parser).adopt(f);
    }

    parse(input: Input<string>) {
        return this.parser.parse(input);
    }

    or(other: StringOrParser) {
        return new StringParserBuilderImp(choice(this.parser, parser(other)));
    }

    followedBy(next: StringOrParser) {
        return  new StringParserBuilderImp(adopt(sequence(this.parser, parser(next)), p => pegPairLeft(p) + pegPairRight(p)));
    }

    atLeastOne() {
        return plus(this.parser);
    }

    anyNumber() {
        return star(this.parser);
    }

    maybe() {
        return question(this.parser);
    }

    not() {
        return notStr(this.parser);
    }

    toString() {
        return this.parser.toString();
    }
}
