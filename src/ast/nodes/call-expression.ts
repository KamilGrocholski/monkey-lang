import { Expression } from '..'
import { Token } from '../../lexer'

export class CallExpression extends Expression {
    constructor(
        public token: Token,
        public fn: Expression | null = null,
        public args: Expression[] | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `${this.fn?.toString()}(${this.args
            ?.map((arg) => arg.toString())
            .join(', ')})`
    }
}
