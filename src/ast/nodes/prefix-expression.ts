import { Token } from '../../lexer'
import { Expression } from '..'

export class PrefixExpression extends Expression {
    public right: Expression | null = null
    constructor(token: Token, public operator: string) {
        super(token)
    }

    toString(): string {
        return `(${this.operator}${this.right?.toString()})`
    }
}
