import { Expression } from '..'
import { Token } from '../../lexer'

export class InfixExpression extends Expression {
    public right: Expression | null = null
    constructor(
        token: Token,
        public operator: string,
        public left: Expression | null = null
    ) {
        super(token)
    }

    toString(): string {
        return `(${this.left?.toString()} ${
            this.operator
        } ${this.right?.toString()})`
    }
}
