import * as explan from './explan';
import { Parser } from '../src/index';
import {
    atLeastOne, anyNumberOf,
    startsWith, either, builder,
    str, stringInput,
    recursive,
    ifStarts, ifNotStarts,
    predefined as pre,
    ParserBuilder, Fail, Success,
} from '../src/index';

export namespace Implementation {
    const add = str("+");
    const sub = str("-");
    const mult = str("*");
    const div = str("/");
    const eq = str("==");
    const lessThan = str("<=");
    const grThan = str("=>");

    export const trivia = pre.trivia.produce(explan.Trivia);

    function parseKeyword(word: string) {
        return trivia.followedBy(str(word)).produce(explan.Keyword);
    }
    const ifKeyword = parseKeyword("if");
    const thenKeyword = parseKeyword("then");
    const elseKeyword = parseKeyword("else");
    const letKeyword = parseKeyword("let");
    const letfunKeyword = parseKeyword("letfun");
    const inKeyword = parseKeyword("in");
    const fnKeyword = parseKeyword("fn");
    const trueKeyword = parseKeyword("true");
    const falseKeyword = parseKeyword("false");

    const keyword = ifKeyword
        .or(thenKeyword)
        .or(elseKeyword)
        .or(letKeyword)
        .or(inKeyword)
        .or(fnKeyword)
        .or(trueKeyword)
        .or(falseKeyword);

    function parseSymbol(sym: string) {
        return trivia.followedBy(str(sym)).produce(explan.Symbol);
    }

    const eqSym = parseSymbol("=");
    const openOval = parseSymbol("(");
    const closeOval = parseSymbol(")");
    const openSq = parseSymbol("[");
    const closeSq = parseSymbol("]");
    const fnArrow = parseSymbol("=>");
    const colon = parseSymbol(":");
    const comma = parseSymbol(",");

    const numLiteral = trivia.followedBy(pre.float).produce(explan.NumLiteral);
    const boolLiteral = trivia.followedBy(str("true").or("false")).produce(explan.BoolLiteral);
    const stringLiteral = trivia.followedBy(pre.aString).produce(explan.StringLiteral);
    const literal = either<explan.Literal>(numLiteral).or(boolLiteral).or(stringLiteral);
    export const topId = trivia.followedBy(ifNotStarts(keyword).then(pre.identifier)).produce(explan.Identifier);
    export const fieldId = trivia.followedBy(ifNotStarts(keyword).then(pre.alphanum.atLeastOne())).produce(explan.Identifier);

    const boolPrescOperator = trivia.followedBy(eq).produce(explan.Symbol);
    const compPrescOperator = trivia.followedBy(either(lessThan).or(grThan)).produce(explan.Symbol);
    const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(explan.Symbol);
    const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(explan.Symbol);

    export const expression = recursive<string, explan.Expression>();

    const literalExpression = literal.produce(explan.LiteralExpression);
    const namedFuncExpression = fnKeyword
        .followedBy(topId)
        .followedBy(topId)
        .followedBy(fnArrow)
        .followedBy(expression)
        .produce(explan.NamedFuncExpression);
    const anonymousFuncExpression = topId
        .followedBy(fnArrow)
        .followedBy(expression)
        .produce(explan.AnonymousFuncExpression);
    export const identifierExpression = topId.produce(explan.IdentifierExpression);

    export const expressionList = pre.syntaxList(expression, comma, explan.ExpressionList);
    export const tupleExpression = openOval.followedBy(expressionList).followedBy(closeOval).produce(explan.TupleExpression);
    const atomExpression = either<explan.Expression>(namedFuncExpression)
        .or(anonymousFuncExpression)
        .or(literalExpression)
        .or(identifierExpression)
        .or(tupleExpression);

    export const referenceExpression = pre.postfix(atomExpression, fieldId, explan.ReferenceExpression);
    export const indexer = openSq.followedBy(expression).followedBy(closeSq).produce(explan.Indexer);
    export const indexExpression = pre.postfix(referenceExpression, indexer, explan.IndexExpression);
    export const callExpression = pre.binary(indexExpression, colon, explan.CallExpression);
    const multExpression = pre.binary(callExpression, multPrescOperator, explan.BinaryExpression);
    const addExpression = pre.binary(multExpression, addPrescOperator, explan.BinaryExpression);
    const compExpression = pre.binary(addExpression, compPrescOperator, explan.BinaryExpression);
    const boolExpression = pre.binary(compExpression, boolPrescOperator, explan.BinaryExpression);
    const arithmeticExpression = boolExpression;

    const ifExpression = ifKeyword
        .followedBy(expression)
        .followedBy(thenKeyword)
        .followedBy(expression)
        .followedBy(elseKeyword)
        .followedBy(expression)
        .produce(explan.IfExpression);

    const valDeclaration = letKeyword
        .followedBy(topId)
        .followedBy(eqSym)
        .followedBy(expression)
        .produce(explan.LetValDeclaration);
    const funDeclaration = letfunKeyword
        .followedBy(topId)
        .followedBy(topId)
        .followedBy(eqSym)
        .followedBy(expression)
        .produce(explan.LetFuncDeclaration);
    const declaration = either<explan.LetDeclaration>(valDeclaration).or(funDeclaration);
    const letExpression = declaration.atLeastOne()
        .followedBy(inKeyword)
        .followedBy(expression)
        .produce(explan.LetExpression);

    const actualExpression = either<explan.Expression>(ifExpression)
        .or(letExpression)
        .or(arithmeticExpression);

    expression.set(actualExpression);
}

export const parser = Implementation.expression;

export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
