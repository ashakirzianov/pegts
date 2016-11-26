export class Input<TInput> {
    readonly stream: TInput;
}

export type Result<TInput, TOutput> = Success<TInput, TOutput> | Fail<TInput>;

export class Success<TInput, TOutput> {
    constructor(readonly value: TOutput, readonly next: Input<TInput>, readonly lookAhead: number) {}
    readonly success: true = true;
}

export class Fail<TInput> {
    constructor(readonly lookAhead: number) {}
    readonly success: false = false;
}

export interface Parser<TInput, TOutput> {
    parse(input: Input<TInput>): Result<TInput, TOutput>;
}