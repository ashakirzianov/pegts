import { Parser, Input, Fail, Result } from './core';
import { ParserBuilder, builder } from './parserBuilder';

export * from './core';

export {
    startsWith, builder,
    atLeastOne, anyNumberOf, maybe, ifStarts, ifNotStarts,
    ParserBuilder,
} from './parserBuilder';

export {
    charset, either,
    str, stringInput, notStr, anyChar, reg,
    plus, star, question,
    StringParserBuilder,
} from './stringBuilder';

export function recursive<TO>() {
    return new RecursiveParser<string, TO>();
}

export class RecursiveParser<TI, TO> implements Parser<TI, TO> {
    private parser?: Parser<TI, TO> = undefined;

    set(parser: Parser<TI, TO>) {
        this.parser = parser;
    }

    parse(input: Input<TI>): Result<TI, TO> {
        return this.parser ? this.parser.parse(input) : new Fail(0);
    }

    toString() {
        return this.parser ? this.parser.toString() : "<null>";
    }
}
