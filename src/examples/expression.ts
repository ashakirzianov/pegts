import {
    Symbol, Keyword, Identifier, Trivia, DynamicEnvironment, SyntaxList,
} from './core';
import {
    Value, FuncValue, NumValue, BoolValue, ErrorValue, StringValue, RecordValue,
    unknownIdentifier, typeMismatch, unexpectedType, operatorMismatch, // TODO: consider move to the Expression.ts
} from './value';
import { Literal } from './literal';

export abstract class Expression {
    as<T extends Expression>(): T {
        return this as any as T;
    }

    rootEval(): Value {
        return this.eval(new DynamicEnvironment());
    }

    abstract eval(env: DynamicEnvironment): Value;
}

export class IdentifierExpression extends Expression {
    constructor (readonly id: Identifier) { super(); }

    eval(env: DynamicEnvironment): Value {
        return env.get(this.id.identifier) || unknownIdentifier(this.id.identifier);
    }

    toString() {
        return this.id.toString();
    }
}

export class ReferenceExpression extends Expression {
    constructor (readonly exp: Expression, readonly fieldId: Identifier) { super(); }

    eval(env: DynamicEnvironment): Value {
        const headVal = this.exp.eval(env);
        return headVal.field(this.fieldId.identifier);
    }

    toString() {
        return `${this.exp}${this.fieldId}`;
    }
}

export class Indexer {
    constructor (readonly op: Symbol, readonly index: Expression, readonly cl: Symbol) {}

    toString() {
        return `${this.op}${this.index}${this.cl}`;
    }
}

export class IndexExpression extends Expression {
    constructor (readonly exp: Expression, readonly indexer: Indexer) { super(); }

    eval(env: DynamicEnvironment): Value {
        const val = this.exp.eval(env);
        const i = this.indexer.index.eval(env);
        return typeof (i.value) === "string" || typeof (i.value) === "number" ? val.field(i.value) : unexpectedType(i, "string");
    }

    toString() {
        return `${this.exp}${this.indexer}`;
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

export class ExpressionList extends SyntaxList<Expression, Symbol> {}

export class TupleExpression extends Expression {
    constructor(readonly lp: Symbol, readonly exps: ExpressionList, readonly rp: Symbol) { super(); }

    eval(env: DynamicEnvironment) {
        const head = this.exps.head.eval(env);
        const tail = this.exps.tail.reduce((arr, e) => {
            arr.push(e.syntax.eval(env));
            return arr;
        }, [head]);
        return tail.length > 1 ? new RecordValue(tail) : head;
    }

    toString() {
        return this.lp.toString() + this.exps.toString() + this.rp.toString();
    }
}

export class AnonymousFuncExpression extends Expression {
    constructor(
        readonly arg: Identifier,
        readonly arrow: Symbol,
        readonly exp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        return new FuncValue(this.arg.identifier, this.exp, env);
    }

    toString() {
        return `${this.arg}${this.arrow}${this.exp}`;
    }
}

export class NamedFuncExpression extends Expression {
    constructor(
        readonly fnKeyword: Keyword,
        readonly name: Identifier,
        readonly arg: Identifier,
        readonly arrow: Symbol,
        readonly exp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        return new FuncValue(this.arg.identifier, this.exp, env, this.name.identifier);
    }

    toString() {
        return `${this.fnKeyword}${this.name}${this.arg}${this.arrow}${this.exp}`;
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
export type LetDeclaration = LetValDeclaration | LetFuncDeclaration;
export class LetValDeclaration {
    constructor (readonly letKeyword: Keyword, readonly id: Identifier, readonly eqSign: Symbol, readonly exp: Expression) {}

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

export class LetFuncDeclaration {
    constructor (
        readonly letfunKeyword: Keyword,
        readonly id: Identifier,
        readonly arg: Identifier,
        readonly eqSign: Symbol,
        readonly exp: Expression) {}

    extend(env: DynamicEnvironment) {
        return new DynamicEnvironment({
            key: this.id.identifier,
            value: new FuncValue(this.arg.identifier, this.exp, env, this.id.identifier),
        }, env);
    }

    toString() {
        return `${this.letfunKeyword}${this.id}${this.arg}${this.eqSign}${this.exp}`;
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
    constructor(readonly fnExp: Expression, readonly colon: Symbol, readonly argExp: Expression) { super(); }

    eval(env: DynamicEnvironment) {
        const fnVal = this.fnExp.eval(env);
        if (fnVal.kind !== "func") {
            return unexpectedType(fnVal, "func");
        }

        const argVal = this.argExp.eval(env);
        const fnEnv = new DynamicEnvironment({
            key: fnVal.arg,
            value: argVal,
        }, !fnVal.name ? fnVal.env : new DynamicEnvironment({
            key: fnVal.name,
            value: fnVal,
        }, fnVal.env));

        return fnVal.exp.eval(fnEnv);
    }

    toString() {
        return `${this.fnExp.toString()}${this.colon}${this.argExp.toString()}`;
    }
}
