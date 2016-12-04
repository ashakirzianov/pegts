import { expect } from "chai";
import { Parser } from "../src/Core";
import { stringInput } from "../src/StringBuilder";

export default function expectParser<T>(parser: Parser<string, T>) {
    return new ExpectParser(parser);
}

export function ThrowError(message: string | undefined = undefined): never {
    throw new Error(message);
}

export function match<T>(parser: Parser<string, T>, input: string): T | undefined {
    const result = parser.parse(stringInput(input));
    return result.success ? result.value : undefined;
}

export class ExpectParser<T> {
    constructor(readonly parser: Parser<string, T>) {}

    against(input: string) {
        return new Expectations(this.parser, input);
    }
}

export class Expectations<T> {
    constructor(readonly parser: Parser<string, T>, readonly input: string) {}

    toMatch() {
        expect(match(this.parser, this.input), this.input).to.not.be.undefined;
    }

    toProduce<T>(value: T) {
        expect(match(this.parser, this.input), this.input).to.be.deep.equal(value);
    }
}
