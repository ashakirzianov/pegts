import * as explan from './explan';
import {
    atLeastOne, anyNumberOf,
    startsWith, either, builder,
    str, stringInput,
    recursive,
    ifStarts, ifNotStarts,
    predefined as pre,
    Parser, ParserBuilder, ProxyParserBuilder, Fail, Success,
} from '../index';

export namespace Implementation {
    const add = str("+");
    const sub = str("-");
    const mult = str("*");
    const div = str("/");
    const eq = str("==");
    const lessThan = str("<=");
    const grThan = str("=>");

    export const trivia = pre.trivia.construct(explan.Trivia);

    function parseKeyword(word: string) {
        return trivia.followedBy(str(word)).construct(explan.Keyword);
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
        return trivia.followedBy(str(sym)).construct(explan.Symbol);
    }

    const eqSym = parseSymbol("=");
    const openOval = parseSymbol("(");
    const closeOval = parseSymbol(")");
    const openSq = parseSymbol("[");
    const closeSq = parseSymbol("]");
    const fnArrow = parseSymbol("=>");
    const colon = parseSymbol(":");
    const comma = parseSymbol(",");

    const numLiteral = trivia.followedBy(pre.float).construct(explan.NumLiteral);
    const boolLiteral = trivia.followedBy(str("true").or("false")).construct(explan.BoolLiteral);
    const stringLiteral = trivia.followedBy(pre.aString).construct(explan.StringLiteral);
    const literal = either<explan.Literal>(numLiteral).or(boolLiteral).or(stringLiteral);
    export const topId = trivia.followedBy(ifNotStarts(keyword).then(pre.identifier)).construct(explan.Identifier);
    export const fieldId = trivia.followedBy(ifNotStarts(keyword).then(pre.alphanum.atLeastOne())).construct(explan.Identifier);

    const boolPrescOperator = trivia.followedBy(eq).construct(explan.Symbol);
    const compPrescOperator = trivia.followedBy(either(lessThan).or(grThan)).construct(explan.Symbol);
    const addPrescOperator = trivia.followedBy(either(add).or(sub)).construct(explan.Symbol);
    const multPrescOperator = trivia.followedBy(either(mult).or(div)).construct(explan.Symbol);

    export const expression = recursive<string, explan.Expression>();

    const literalExpression = literal.construct(explan.LiteralExpression);
    const namedFuncExpression = fnKeyword
        .followedBy(topId)
        .followedBy(topId)
        .followedBy(fnArrow)
        .followedBy(expression)
        .construct(explan.NamedFuncExpression);
    const anonymousFuncExpression = topId
        .followedBy(fnArrow)
        .followedBy(expression)
        .construct(explan.AnonymousFuncExpression);
    export const identifierExpression = topId.construct(explan.IdentifierExpression);

    export const expressionList = pre.syntaxList(expression, comma, explan.ExpressionList);
    export const tupleExpression = openOval.followedBy(expressionList).followedBy(closeOval).construct(explan.TupleExpression);
    const atomExpression = either<explan.Expression>(namedFuncExpression)
        .or(anonymousFuncExpression)
        .or(literalExpression)
        .or(identifierExpression)
        .or(tupleExpression);

    export const referenceExpression = pre.postfix(atomExpression, fieldId, explan.ReferenceExpression);
    export const indexer = openSq.followedBy(expression).followedBy(closeSq).construct(explan.Indexer);
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
        .construct(explan.IfExpression);

    const valDeclaration = letKeyword
        .followedBy(topId)
        .followedBy(eqSym)
        .followedBy(expression)
        .construct(explan.LetValDeclaration);
    const funDeclaration = letfunKeyword
        .followedBy(topId)
        .followedBy(topId)
        .followedBy(eqSym)
        .followedBy(expression)
        .construct(explan.LetFuncDeclaration);
    const declaration = either<explan.LetDeclaration>(valDeclaration).or(funDeclaration);
    const letExpression = declaration.atLeastOne()
        .followedBy(inKeyword)
        .followedBy(expression)
        .construct(explan.LetExpression);

    const actualExpression = either<explan.Expression>(ifExpression)
        .or(letExpression)
        .or(arithmeticExpression);

    expression.set(actualExpression);
}

export const parser = Implementation.expression;

export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
