export function evaluate(exp: Expression) {
    return exp.eval(new DynamicEnvironment());
}

export type Value = NumValue | BoolValue | StringValue | ErrorValue;
type ValueKind = "num" | "bool" | "string";

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

    toString() {
        return `Error(${this.message})`;
    }
}

function typeMismatch(left: Value, right: Value) {
    return new ErrorValue(`Type mismatch: ${left} and ${right}`);
}

function unexpectedType(val: Value, expected: ValueKind) {
    return new ErrorValue(`Expected type: ${expected}, actual: ${val.kind}`);
}

function operatorMismatch(left: Value, right: Value, op: string) {
    return new ErrorValue(`Operator: ${op} can not be applied to ${left} and ${right}`);
}

function unknownIdentifier(id: string) {
    return new ErrorValue(`Unknown identifier: ${id}`);
}

export type KeyValue = { key: string, value: Value };
export class DynamicEnvironment {
    constructor(readonly kvp: KeyValue | undefined = undefined, readonly parent: DynamicEnvironment | undefined = undefined) { }

    get(key: string): Value | undefined {
        return this.kvp && this.kvp.key === key ? this.kvp.value : this.parent && this.parent.get(key);
    }
}

export class Trivia {
    constructor(readonly trivia: string) { }

    toString() {
        return this.trivia;
    }
}

export class Symbol {
    constructor(readonly trivia: Trivia, readonly symbol: string) { }

    toString() {
        return this.trivia + this.symbol;
    }
}

export class Keyword extends Symbol {
}

export class Identifier {
    constructor (readonly trivia: Trivia, readonly identifier: string) {}

    toString() {
        return this.trivia + this.identifier;
    }
}

export abstract class Expression {
    abstract eval(env: DynamicEnvironment): Value;
}

export class IdentifierExpression extends Expression {
    constructor (readonly id: Identifier) { super(); }

    eval(env: DynamicEnvironment): Value {
        return env.get(this.id.identifier) || unknownIdentifier(this.id.identifier);
    }

    toString() {
        return this.id;
    }
}

export class BinaryExpression extends Expression {
    constructor(readonly left: Expression, readonly op: Symbol, readonly right: Expression) { super(); }

    eval(env: DynamicEnvironment): Value {
        const leftVal = this.left.eval(env);
        const rightVal = this.right.eval(env);
        if (leftVal.kind === "num") {
            return rightVal.kind === "num" ? this.evalNum(leftVal, rightVal) : typeMismatch(leftVal, rightVal);
        }

        return new ErrorValue("Operation is not supported"); // TODO: meaningful message
    }

    toString() {
        return this.left.toString() + this.op.toString() + this.right.toString();
    }

    private evalNum(leftVal: NumValue, rightVal: NumValue): Value {
        switch (this.op.symbol) {
            case "+":
                return new NumValue(leftVal.value + rightVal.value);
            case "-":
                return new NumValue(leftVal.value - rightVal.value);
            case "*":
                return new NumValue(leftVal.value * rightVal.value);
            case "/":
                return new NumValue(leftVal.value / rightVal.value);
            default:
                return operatorMismatch(leftVal, rightVal, this.op.symbol);
        }
    }
}

export class ParenthesisExpression extends Expression {
    constructor(readonly lp: Symbol, readonly exp: Expression, readonly rp: Symbol) { super(); }

    eval(env: DynamicEnvironment) {
        return this.exp.eval(env);
    }

    toString() {
        return this.lp.toString() + this.exp.toString() + this.rp.toString();
    }
}

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

export class LiteralExpression extends Expression {
    constructor(readonly literal: Literal) { super(); }

    eval(env: DynamicEnvironment) {
        return this.literal.value();
    }

    toString() {
        return this.literal.toString();
    }
}

export class IfExpression extends Expression {
    constructor(
        readonly ifKeyword: Keyword,
        readonly cond: Expression,
        readonly thenKeyword: Keyword,
        readonly thenExpression: Expression,
        readonly elseKeyword: Keyword,
        readonly elseExpression: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        const condVal = this.cond.eval(env);
        if (condVal.kind !== "bool") {
            return unexpectedType(condVal, "bool");
        }

        return condVal.value ? this.thenExpression.eval(env) : this.elseExpression.eval(env);
    }

    toString() {
        return this.ifKeyword.toString() + this.cond.toString() + this.thenKeyword.toString()
            + this.thenExpression.toString() + this.elseKeyword.toString() + this.elseExpression.toString();
    }
}

export class LetDeclaration {
    constructor (readonly letKeyword: Keyword, readonly id: Identifier, readonly eqSign: Symbol, readonly exp: Expression) {}

    // TODO: implement letrec
    extend(env: DynamicEnvironment) {
        return new DynamicEnvironment({
            key: this.id.identifier,
            value: this.exp.eval(env),
        }, env);
    }

    toString() {
        return this.letKeyword.toString() + this.id.toString() + this.eqSign.toString() + this.exp.toString();
    }
}

export class LetExpression extends Expression {
    constructor(readonly decls: LetDeclaration[], readonly inKeyword: Keyword, readonly exp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        return this.exp.eval(this.decls.reduce((e, decl) => decl.extend(e), env));
    }

    toString() {
        return this.decls.reduce((acc, d) => acc + d.toString(), "") + this.inKeyword.toString() + this.exp.toString();
    }
}
