import { Expression, Statement } from '..'
import { Token } from '../../lexer'

export class ReturnStatement extends Statement {
    constructor(
        public token: Token,
        public returnValue: Expression | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `return ${this.returnValue?.toString()};`
    }
}
