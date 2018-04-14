import { Value } from "./Value";

export type Binding = { key: string, value: Value };
export type Bindings = Binding[];

export function bindings(bs: Binding[]): Bindings {
    return bs;
}

export function concatBindings(bsl: Bindings, bsr: Bindings): Bindings {
    return bsl.concat(bsr);
}

export class DynamicEnvironment {
    constructor(readonly kvp: Binding | undefined = undefined, readonly parent: DynamicEnvironment | undefined = undefined) { }

    get(key: string): Value | undefined {
        return this.kvp && this.kvp.key === key ? this.kvp.value : this.parent && this.parent.get(key);
    }
}

export type Children = IArguments;
function toArray(args: IArguments) {
    const arr = new Array<any>();
    for (let i = 0; i < args.length; i++) {
        arr.push(args[i]);
    }

    return arr;
}
export abstract class SyntaxTree {
    constructor (readonly children: Children) {}

    toString() {
        return toArray(this.children).reduce((s, ch) => s + ch.toString(), "");
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
        return this.trivia.toString() + this.identifier.toString();
    }
}

export class SyntaxList<T, S> {
    constructor(readonly head: T, readonly tail: Array<{ separator: S, syntax: T}>, readonly last?: S) {}

    toString() {
        const list = this.tail.reduce((l, ce) => `${l}${ce.separator}${ce.syntax}`, this.head.toString());
        return this.last ? list + this.last.toString() : list;
    }
}
