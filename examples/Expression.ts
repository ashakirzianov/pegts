import { Symbol, Keyword, Identifier, Trivia } from "./Core";
import {
    DynamicEnvironment,
    Value, FuncValue, NumValue, BoolValue, ErrorValue, StringValue,
    unknownIdentifier, typeMismatch, unexpectedType, operatorMismatch, // TODO: consider move to the Expression.ts
} from "./Value";
import { Literal } from "./Literal";

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
            case "==":
                return new BoolValue(leftVal.value === rightVal.value);
            case "<=":
                return new BoolValue(leftVal.value <= rightVal.value);
            case ">=":
                return new BoolValue(leftVal.value >= rightVal.value);
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

export class FuncExpression extends Expression {
    constructor(readonly fnKeyword: Keyword, readonly id: Identifier, readonly arrow: Symbol, readonly exp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        return new FuncValue(this.id.identifier, this.exp, env);
    }

    toString() {
        return `${this.fnKeyword}${this.id}${this.arrow}${this.exp}`;
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

export class CallExpression extends Expression {
    constructor(readonly fnExp: Expression, readonly argExp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        const fnVal = this.fnExp.eval(env);
        if (fnVal.kind !== "func") {
            return unexpectedType(fnVal, "func");
        }

        const argVal = this.argExp.eval(env);
        const fnEnv = new DynamicEnvironment({
            key: fnVal.arg,
            value: argVal,
        }, new DynamicEnvironment({
            key: "self",
            value: fnVal,
        }, fnVal.env));

        return fnVal.exp.eval(fnEnv);
    }
}
