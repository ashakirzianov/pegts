import { Parser } from "../src/core";
import {
    Trivia, Special,
    Expression, BinaryExpression,
    LiteralExpression, NumLiteral, BoolLiteral, StringLiteral,
} from "./explan";
import {
    atLeastOne, anyNumberOf,
    startsWith, either,
    string, stringInput,
    recursive,
} from "../src/fluentBuilder";

const whiteSpace = string(" ").parser;

const digit = string("0").or("1").or("2").or("3").or("4").or("5").or("6").or("7").or("8").or("9").parser;
const num = atLeastOne(digit).reduce((acc, s) => acc + s, "");

const add = string("+").parser;
const sub = string("-").parser;
const mult = string("*").parser;
const div = string("/").parser;

const trivia = startsWith(anyNumberOf(whiteSpace).reduce((acc, s) => acc + s, "").parser()).produce(Trivia);

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
