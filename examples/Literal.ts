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
        return new StringValue(this.unqoute(this.literal));
    }

    toString() {
        return this.trivia.toString() + this.literal;
    }

    private unqoute(str: string) {
        return str[0] === "'" ?
            (str[str.length-1] === "'" ? str.slice(1, str.length - 1) : str)
            : (str[0] === '"' ? str.slice(1, str.length - 1) : str);
    }
}

export class BoolLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new BoolValue(this.literal === "true");
    }

    toString() {
        return this.trivia.toString() + this.literal;
    }
}
