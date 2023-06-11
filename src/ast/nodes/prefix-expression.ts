import { Token } from '../../lexer'
import { Expression } from '..'

export class PrefixExpression extends Expression {
    constructor(
        token: Token,
        public operator: string,
        public right: Expression | null = null
    ) {
        super(token)
    }

    toString(): string {
        return this.operator
    }
}
