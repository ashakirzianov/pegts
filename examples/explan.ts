export type Value = NumValue | BoolValue | StringValue | ErrorValue;

export class NumValue {
    readonly kind: "num" = "num";
    constructor(readonly value: number) { }

    toString() {
        return `Num(${this.value})`;
    }
}

export class BoolValue {
    readonly kind: "bool" = "bool";
    constructor(readonly value: boolean) { }

    toString() {
        return `Bool(${this.value})`;
    }
}

export class StringValue {
    readonly kind: "string" = "string";
    constructor(readonly value: string) { }

    toString() {
        return `String(${this.value})`;
    }
}

export class ErrorValue {
    readonly kind: "error" = "error";
    constructor(readonly message: string, readonly parent: Value | undefined = undefined) { }
}

function typeMismatch(left: Value, right: Value) {
    return new ErrorValue(`Type mismatch: ${left} and ${right}`);
}

function operatorMismatch(left: Value, right: Value, op: string) {
    return new ErrorValue(`Operator: ${op} can not be applied to ${left} and ${right}`);
}

export type KeyValue = { key: string, value: Value };
export class Environment {
    constructor(readonly kvp: KeyValue | undefined = undefined, readonly parent: Environment | undefined = undefined) { }

    get(key: string): Value | undefined {
        return this.kvp && this.kvp.key === key ? this.kvp.value : this.parent && this.parent.get(key);
    }
}

export class Trivia {
    constructor(readonly trivia: string[]) { }
}

export class Special {
    constructor(readonly trivia: Trivia, readonly string: string) { }
}

export abstract class Expression {
    abstract eval(env: Environment): Value;
}

export class BinaryExpression extends Expression {
    constructor(readonly left: Expression, readonly op: Special, readonly right: Expression) { super(); }

    eval(env: Environment): Value {
        const leftVal = this.left.eval(env);
        const rightVal = this.right.eval(env);
        if (leftVal.kind === "num") {
            return rightVal.kind === "num" ? this.evalNum(leftVal, rightVal) : typeMismatch(leftVal, rightVal);
        }

        return new ErrorValue("Operation is not supported"); // TODO: meaningful message
    }

    private evalNum(leftVal: NumValue, rightVal: NumValue): Value {
        switch (this.op.string) {
            case "+":
                return new NumValue(leftVal.value + rightVal.value);
            case "-":
                return new NumValue(leftVal.value - rightVal.value);
            case "*":
                return new NumValue(leftVal.value * rightVal.value);
            case "/":
                return new NumValue(leftVal.value / rightVal.value);
            default:
                return operatorMismatch(leftVal, rightVal, this.op.string);
        }
    }
}

export class ParenthesisExpression extends Expression {
    constructor(readonly lp: Special, readonly exp: Expression, readonly rp: Expression) { super(); }

    eval(env: Environment) {
        return this.exp.eval(env);
    }
}

export type Literal = NumLiteral | StringLiteral | BoolLiteral;
export class NumLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new NumValue(+this.literal);
    }
}

export class StringLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new StringValue(this.literal);
    }
}

export class BoolLiteral {
    constructor(readonly trivia: Trivia, readonly literal: string) {}
    value() {
        return new BoolValue(!!this.literal);
    }
}

export class LiteralExpression extends Expression {
    constructor(readonly literal: Literal) { super(); }

    eval(env: Environment) {
        return this.literal.value();
    }
}