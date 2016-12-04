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
