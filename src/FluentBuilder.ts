import { Parser, Input, Fail } from "./Core";
import { ParserBuilder, builder } from "./ParserBuilder";

export {
    startsWith,
    either,
    atLeastOne, anyNumberOf, maybe, iff, iffNot,
} from "./ParserBuilder";

export {
    str, stringInput, notStr, anyChar,
    plus, star, question,
    StringParserBuilder,
} from "./StringBuilder";

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
