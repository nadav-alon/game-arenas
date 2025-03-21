export type IsTuple<T extends ReadonlyArray<unknown>> = T extends readonly []
    ? true
    : T extends readonly [unknown, ...unknown[]]
    ? true
    : false;