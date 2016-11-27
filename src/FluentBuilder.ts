import { Parser, Input, Fail } from "./Core";
import { ParserBuilder, builder } from "./ParserBuilder";

export {
    startsWith,
    atLeastOne, anyNumberOf,
} from "./ParserBuilder";

export {
    string, stringInput,
} from "./StringBuilder";

export function either<TI, TO>(parser: Parser<TI, TO>): ParserBuilder<TI, TO> {
    return builder(parser);
}

export function recursive<TO>() {
    return new RecursiveParser<string, TO>();
}

export class RecursiveParser<TI, TO> implements Parser<TI, TO> {
    private parser: Parser<TI, TO> | undefined = undefined;

    set(parser: Parser<TI, TO>) {
        this.parser = parser;
    }

    parse(input: Input<TI>) {
        return this.parser ? this.parser.parse(input) : new Fail(0);
    }
}
