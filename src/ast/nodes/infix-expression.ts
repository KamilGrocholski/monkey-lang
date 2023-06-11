import { Expression } from '..'
import { Token } from '../../lexer'

export class InfixExpression extends Expression {
    constructor(
        token: Token,
        public operator: string,
        public left: Expression | null = null,
        public right: Expression | null = null
    ) {
        super(token)
    }

    toString(): string {
        return `${this.left?.toString()} ${this.operator}`
    }
}
