import { Parser, Input, Success, Fail } from "./core";
import { choice } from "./operators";

export function prefix(str: string): Parser<string, string> {
    return new PrefixParser(str);
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

export interface StringParserBuilder extends Parser<string, string> {
    readonly parser: Parser<string, string>;
    or(other: StringOrParser): StringParserBuilder;
}

export function string(str: string): StringParserBuilder {
    return new StringParserBuilderImp(prefix(str));
}

export class StringParserBuilderImp implements Parser<string, string> {
    constructor(readonly parser: Parser<string, string>) {}

    parse(input: Input<string>) {
        return this.parser.parse(input);
    }

    or(other: StringOrParser) {
        return new StringParserBuilderImp(choice(this.parser, isParser(other) ? other : prefix(other)));
    }
}
