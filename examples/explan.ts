import {
    DynamicEnvironment, Value,
} from "./Value";

import { Expression } from "./Expression";

export function evaluate(exp: Expression) {
    return exp.eval(new DynamicEnvironment());
}

export * from "./Core";
export * from "./Value";
export * from "./Literal";
export * from "./Expression";
