import { Parser, Input, Fail, Result } from './core';
import { ParserBuilder, builder } from './parserBuilder';

export * from './core';

export {
    startsWith, builder,
    atLeastOne, anyNumberOf, maybe, ifStarts, ifNotStarts,
    recursive,
    ParserBuilder, Parse,
} from './parserBuilder';

export {
    charset, either,
    str, stringInput, notStr, anyChar, reg,
    plus, star, question,
    StringParserBuilder, Str,
} from './stringBuilder';
