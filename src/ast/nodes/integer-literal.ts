import { Expression } from '..'
import { Token } from '../../lexer'

export class IntegerLiteral extends Expression {
    constructor(public token: Token, public value: number) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.token.literal
    }
}
