import { Parser, Input, Success, Fail } from "./core";

export function prefix(str: string): Parser<string, string> {
    return new PrefixParser(str);
}

export function makeInput(str: string): Input<string> {
    return new StringInput(str);
}

class StringInput implements Input<string> {
    constructor(readonly stream: string) {}
}

class PrefixParser implements Parser<string, string> {
    constructor(readonly prefix: string) {}

    parse(input: Input<string>) {
        return input.stream.lastIndexOf(this.prefix, 0) === 0 ?
            new Success(this.prefix, makeInput(input.stream.substr(this.prefix.length)), this.prefix.length)
            : new Fail(this.prefix.length);
    }
}