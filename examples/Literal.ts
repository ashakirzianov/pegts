import { Trivia } from "./Core";
import { Value, NumValue, StringValue, BoolValue } from "./Value";

export type Literal = NumLiteral | StringLiteral | BoolLiteral;
export class NumLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new NumValue(+this.literal);
    }

    toString() {
        return this.trivia.toString() + this.literal;
    }
}

export class StringLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new StringValue(this.literal);
    }

    toString() {
        return this.trivia.toString() + this.literal;
    }
}

export class BoolLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new BoolValue(!!this.literal);
    }

    toString() {
        return this.trivia.toString() + this.literal;
    }
}
