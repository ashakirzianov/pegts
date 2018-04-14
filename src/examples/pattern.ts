import {
    Children, SyntaxTree, Trivia, Symbol, Identifier,
    Bindings,
} from './core';
import { Value } from './value';

export abstract class Pattern extends SyntaxTree {
    // constructor() { super(arguments); }
    // constructor (children: Children) { super(children); }
    abstract match(val: Value): Bindings | undefined;
}

export class WildCardPattern extends Pattern {
    constructor (readonly wc: Symbol) { super(arguments); }

    match(val: Value) {
        return [];
    }
}

export class IdPattern extends Pattern {
    constructor (readonly id: Identifier) { super(arguments); }

    match(val: Value): Bindings {
        return [{
            key: this.id.identifier,
            value: val,
        }];
    }
}

// export class TuplePattern extends Pattern {

// }
