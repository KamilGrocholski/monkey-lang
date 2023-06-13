import { Token } from '../../lexer'
import { Expression } from '..'

export class PrefixExpression extends Expression {
    public right: Expression | null = null
    constructor(public token: Token, public operator: string) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `(${this.operator}${this.right?.toString()})`
    }
}
