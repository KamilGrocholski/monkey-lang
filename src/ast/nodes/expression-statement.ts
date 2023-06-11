import { Expression, Statement } from '..'
import { Token } from '../../lexer'

export class ExpressionStatement extends Statement {
    constructor(token: Token, public exp: Expression | null = null) {
        super(token)
    }

    toString(): string {
        return this.exp?.toString() ?? ''
    }
}
