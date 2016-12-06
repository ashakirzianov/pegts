import { expect } from "chai";
import { Parser } from "../src/Core";
import { stringInput } from "../src/StringBuilder";

export default function parse<T>(parser: Parser<string, T>) {
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

    shouldMatch() {
        this.expectMatch().to.not.be.undefined;
    }

    shouldFail() {
        this.expectMatch().to.be.undefined;
    }

    shouldMatchString(str: string) {
        expect((match(this.parser, this.input) || "").toString(), this.input).to.equal(str);
    }

    shouldBeReversible() {
        this.shouldMatchString(this.input);
    }

    shouldProduce(value: T) {
        this.expectMatch().to.be.deep.equal(value);
    }

    should(f: (v: T) => boolean) {
        expect(f(this.matchOrThrow()), this.input).to.be.true;
    }

    result() {
        return this.matchOrThrow();
    }

    shouldPassTheStream(nextStream: string) {
        const result = this.parser.parse(stringInput(this.input));
        expect(result.success).to.be.true;
        const next = result.success ? result.next : ThrowError("Unexpected undefined");
        expect(next.stream).to.be.eq(nextStream);
    }

    private matchOrThrow() {
        return this.tryMatch() || ThrowError("Unexpected undefined");
    }

    private tryMatch() {
        return match(this.parser, this.input);
    }

    private expectMatch() {
        return  expect(this.tryMatch(), this.input);
    }
}
