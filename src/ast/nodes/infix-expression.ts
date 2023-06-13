import { Expression } from '..'
import { Token } from '../../lexer'

export class InfixExpression extends Expression {
    public right: Expression | null = null
    constructor(
        public token: Token,
        public operator: string,
        public left: Expression | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `(${this.left?.toString()} ${
            this.operator
        } ${this.right?.toString()})`
    }
}
