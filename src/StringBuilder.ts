import { Parser, Input, Success, Fail } from "./Core";
import { choice, zeroMore, oneMore, optional, not, and, adopt } from "./Operators";

export function prefix(str: string): Parser<string, string> {
    return new PrefixParser(str);
}

export function string(str: string): StringParserBuilder {
    return new StringParserBuilderImp(prefix(str));
}

export function notStarts(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(not(parser(sob)), v => ""));
}

export function star(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(zeroMore(parser(sob)), ss => ss.reduce((a, s) => a + s)));
}

export function plus(sob: StringOrParser): StringParserBuilder {
    return new StringParserBuilderImp(adopt(oneMore(parser(sob)), ss => ss.reduce((a, s) => a + s)));
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

export type StringOrParser = string | Parser<string, string>;
function isParser(sob: StringOrParser): sob is Parser<string, string> {
    return typeof sob !== "string";
}
function parser(sob: StringOrParser): Parser<string, string> {
    return isParser(sob) ? sob : prefix(sob);
}

export interface StringParserBuilder extends Parser<string, string> {
    readonly parser: Parser<string, string>;
    or(other: StringOrParser): StringParserBuilder;
    atLeastOne(): StringParserBuilder;
    anyNumber(): StringParserBuilder;
    maybe(): StringParserBuilder;
    not(): StringParserBuilder;
}

class StringParserBuilderImp implements Parser<string, string> {
    constructor(readonly parser: Parser<string, string>) {}

    parse(input: Input<string>) {
        return this.parser.parse(input);
    }

    or(other: StringOrParser) {
        return new StringParserBuilderImp(choice(this.parser, parser(other)));
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
        return notStarts(this.parser);
    }
}
