export class Input<TInput> {
    readonly stream: TInput;
}

export type Result<TInput, TOutput> = Success<TInput, TOutput> | Fail<TInput>;

export class Success<TInput, TOutput> {
    readonly success: true = true;
    constructor(readonly value: TOutput, readonly next: Input<TInput>, readonly lookAhead: number) {}
}

export class Fail<TInput> {
    readonly success: false = false;
    constructor(readonly lookAhead: number) {}
}

export interface Parser<TInput, TOutput> {
    parse(input: Input<TInput>): Result<TInput, TOutput>;
}
