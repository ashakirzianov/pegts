import { expect } from 'chai';
import { Parser } from './core';
import { stringInput } from './stringBuilder';

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

    shouldMatchString(str: string, nextStream?: string) {
        const result = this.parser.parse(stringInput(this.input));
        expect(result.success).to.be.true;
        const suc = result.success ? result : ThrowError("Unexpected undefined");
        expect(suc.value.toString()).to.be.eq(str);
        if (nextStream) {
            expect(suc.next.stream).to.be.eq(nextStream);
        }
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

    remainingStream() {
        const result = this.parser.parse(stringInput(this.input));
        expect(result.success).to.be.true;
        return result.success ? result.next.stream : ThrowError("Unexpected undefined");
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
