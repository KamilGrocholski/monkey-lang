import { Expression } from '..'
import { Token } from '../../lexer'

export class Identifier extends Expression {
    constructor(public token: Token, public value: string) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.value
    }
}
