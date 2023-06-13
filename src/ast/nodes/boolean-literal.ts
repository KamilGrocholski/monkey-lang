import { Expression } from '..'
import { Token } from '../../lexer'

export class BooleanLiteral extends Expression {
    constructor(public token: Token, public value: boolean) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.tokenLiteral()
    }
}
