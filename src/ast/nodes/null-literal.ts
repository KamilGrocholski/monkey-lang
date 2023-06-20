import { Expression } from '..'
import { Token } from '../../lexer'

export class NullLiteral extends Expression {
    constructor(public token: Token) {
        super()
    }

    toString(): string {
        return this.tokenLiteral()
    }

    tokenLiteral(): string {
        return this.token.literal
    }
}
