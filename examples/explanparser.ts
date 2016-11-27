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

import * as pre from "../src/Predefined";

const add = str("+").parser;
const sub = str("-").parser;
const mult = str("*").parser;
const div = str("/").parser;

const trivia = pre.trivia.produce(Trivia);

const numLiteral = trivia.followedBy(pre.float).produce(NumLiteral);
const literal = numLiteral;

const addPrescOperator = trivia.followedBy(either(add).or(sub)).produce(Special);

const multPrescOperator = trivia.followedBy(either(mult).or(div)).produce(Special);

const expression = recursive<Expression>();

const literalExpression = literal.produce(LiteralExpression);
const multExpression = pre.binary(literalExpression, multPrescOperator, BinaryExpression);
const addExpression = pre.binary(multExpression, addPrescOperator, BinaryExpression);

expression.set(addExpression);

const parser = expression;
export default function parseString(source: string) {
    return parser.parse(stringInput(source));
}
