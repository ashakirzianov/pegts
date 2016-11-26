import { Parser, Input, Success, Fail } from "./core";

class StringInput implements Input<string> {
    constructor(readonly stream: string) {}
}

export function prefix(str: string): Parser<string, string> {
    return new PrefixParser(str);
}

class PrefixParser implements Parser<string, string> {
    constructor(readonly prefix: string) {}

    parse(input: Input<string>) {
        return input.stream.lastIndexOf(this.prefix, 0) === 0 ?
            new Success(this.prefix, new StringInput(input.stream.substr(this.prefix.length)), this.prefix.length)
            : new Fail(this.prefix.length);
    }
}