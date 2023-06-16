import { Expression } from '..'
import { Token } from '../../lexer'

export class IndexExpression extends Expression {
    constructor(
        public token: Token,
        public left: Expression | null = null,
        public index: Expression | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return ''
    }
}
