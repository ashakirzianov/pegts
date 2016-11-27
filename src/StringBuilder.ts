import { Parser, Input, Success, Fail } from "./Core";
import { sequence, choice, zeroMore, oneMore, optional, not, and, adopt, pegPairLeft, pegPairRight } from "./Operators";
import { ParserBuilder, Constructor, builder } from "./ParserBuilder";

export function prefix(str: string): Parser<string, string> {
    return new PrefixParser(str);
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

class StringInput implements Input<string> {
    constructor(readonly stream: string) {}
}

class PrefixParser implements Parser<string, string> {
    constructor(readonly prefix: string) {}

    parse(input: Input<string>) {
        return input.stream.lastIndexOf(this.prefix, 0) === 0 ?
            new Success(this.prefix, stringInput(input.stream.substr(this.prefix.length)), this.prefix.length)
            : new Fail(this.prefix.length);
    }
}

class NotPrefixParser implements Parser<string, string> {
    constructor(readonly prefixParser: Parser<string, string>) {}

    parse(input: Input<string>) {
        const r = this.prefixParser.parse(input);
        return r.success ?
            new Fail(r.lookAhead)
            : new Success(input.stream.substr(0, r.lookAhead), stringInput(input.stream.substr(r.lookAhead)), r.lookAhead);
    }
}

class AnyCharParser implements Parser<string, string> {
    parse(input: Input<string>) {
        return input.stream.length > 0 ?
            new Success(input.stream[0], stringInput(input.stream.substr(1)), 1)
            : new Fail(1);
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
}
