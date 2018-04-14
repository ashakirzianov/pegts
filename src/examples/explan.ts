import { Value } from './value';
import { DynamicEnvironment } from './core';
import { Expression } from './expression';

export function evaluate(exp: Expression) {
    return exp.eval(new DynamicEnvironment());
}

export * from './core';
export * from './value';
export * from './literal';
export * from './expression';
