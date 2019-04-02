declare module 'ember-awesome-macros' {
    export function divide(first: any, second: any): number;
    export function bool(functionToCheck: any): boolean;
}

declare module 'ember-awesome-macros/string/match' {
    export default function match(firstString: string | RegExp, secondString: string | RegExp): [] | null;
}
declare module 'ember-awesome-macros/math/ceil' {
    export default function ceil(number: number): number;
}
