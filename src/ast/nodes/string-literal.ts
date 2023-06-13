import { Expression } from '..'
import { Token } from '../../lexer'

export class StringLiteral extends Expression {
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
