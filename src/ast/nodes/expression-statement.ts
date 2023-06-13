import { Expression, Statement } from '..'
import { Token } from '../../lexer'

export class ExpressionStatement extends Statement {
    constructor(public token: Token, public exp: Expression | null = null) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.exp?.toString() ?? ''
    }
}
