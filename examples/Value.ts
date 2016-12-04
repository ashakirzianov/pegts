import { Expression } from "./Expression";
// declare class Expression {};

export type Value = NumValue | BoolValue | StringValue | FuncValue | ErrorValue;
type ValueKind = "num" | "bool" | "string" | "func";

export class FuncValue {
    readonly kind: "func" = "func";
    readonly value: "func" = "func";
    constructor(readonly arg: string, readonly exp: Expression, readonly env: DynamicEnvironment, readonly name?: string) {}

    toString() {
        return `F(${this.arg} => ${this.exp})`;
    }
}

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
    constructor(readonly value: string, readonly parent: Value | undefined = undefined) { }

    toString() {
        return `Error(${this.value})`;
    }
}

export function typeMismatch(left: Value, right: Value) {
    return new ErrorValue(`Type mismatch: ${left} and ${right}`);
}

export function unexpectedType(val: Value, expected: ValueKind) {
    return new ErrorValue(`Expected type: ${expected}, actual: ${val.kind}`);
}

export function operatorMismatch(left: Value, right: Value, op: string) {
    return new ErrorValue(`Operator: ${op} can not be applied to ${left} and ${right}`);
}

export function unknownIdentifier(id: string) {
    return new ErrorValue(`Unknown identifier: ${id}`);
}

export type KeyValue = { key: string, value: Value };
export class DynamicEnvironment {
    constructor(readonly kvp: KeyValue | undefined = undefined, readonly parent: DynamicEnvironment | undefined = undefined) { }

    get(key: string): Value | undefined {
        return this.kvp && this.kvp.key === key ? this.kvp.value : this.parent && this.parent.get(key);
    }
}
