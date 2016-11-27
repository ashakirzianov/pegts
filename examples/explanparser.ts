import { Parser } from "../src/Core";
import {
    Trivia, Special,
    Expression, BinaryExpression,
    LiteralExpression, NumLiteral, BoolLiteral, StringLiteral,
} from "./explan";
import {
    atLeastOne, anyNumberOf,
    startsWith, either,
    str, stringInput,
    recursive,
} from "../src/fluentBuilder";

const whiteSpaces = str(" ").atLeastOne();

const digit = str("0").or("1").or("2").or("3").or("4").or("5").or("6").or("7").or("8").or("9");
const num = digit.atLeastOne();

const add = str("+").parser;
const sub = str("-").parser;
const mult = str("*").parser;
const div = str("/").parser;

const trivia = startsWith(whiteSpaces.maybe().parser).produce(Trivia);

const numLiteral = trivia.followedBy(num).produce(NumLiteral);
const literal = numLiteral;

const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(Special);

const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(Special);

const expression = recursive<Expression>();

const literalExpression = literal.produce(LiteralExpression);
const multExpression = literalExpression
    .followedBy(multPrescOperator)
    .followedBy(literalExpression)
    .produce<Expression>(BinaryExpression)
    .or(literalExpression);
const addExpression = multExpression
    .followedBy(addPrescOperator)
    .followedBy(multExpression)
    .produce<Expression>(BinaryExpression)
    .or(multExpression);

expression.set(addExpression);

const parser = expression;
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
