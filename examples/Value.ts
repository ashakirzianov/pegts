import { Expression } from "./Expression";
// declare class Expression {};

export type Value = NumValue | BoolValue | StringValue | FuncValue | RecordValue | ErrorValue;
export type ValueKind = "num" | "bool" | "string" | "func" | "rec";
export type Key = string;

export abstract class ValueBase {
    field(key: Key): Value {
        return unknownIdentifier(key);
    }
}

export class FuncValue extends ValueBase {
    readonly kind: "func" = "func";
    readonly value: "func" = "func";
    constructor(readonly arg: string, readonly exp: Expression, readonly env: DynamicEnvironment, readonly name?: string) { super(); }

    toString() {
        return `F(${this.arg} => ${this.exp})`;
    }
}

export class NumValue extends ValueBase {
    readonly kind: "num" = "num";
    constructor(readonly value: number) { super(); }

    toString() {
        return `Num(${this.value})`;
    }
}

export class BoolValue extends ValueBase {
    readonly kind: "bool" = "bool";
    constructor(readonly value: boolean) { super(); }

    toString() {
        return `Bool(${this.value})`;
    }
}

export class StringValue extends ValueBase {
    readonly kind: "string" = "string";
    constructor(readonly value: string) { super(); }

    toString() {
        return `String(${this.value})`;
    }
}

export type RecordInterface = { [index: string]: Value } | { [index: number]: Value };

export class RecordValue extends ValueBase {
    readonly kind: "rec" = "rec";
    constructor(readonly value: RecordInterface, readonly name?: string) { super(); }

    field(key: Key): Value {
        return this.value[key];
    }

    keyValues(): Array<{key: string, value: Value }> {
        return Object.keys(this.value).map(k => { return { key: k, value: this.value[k] }; });
    }

    toString() {
        return this.name ? `${this.name}{${this.keyValues()}}` : `{${this.keyValues()}}`;
    }
}

export class ErrorValue extends ValueBase {
    readonly kind: "error" = "error";
    constructor(readonly value: string, readonly parent: Value | undefined = undefined) { super(); }

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
