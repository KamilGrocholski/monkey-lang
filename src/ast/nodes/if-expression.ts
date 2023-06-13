import { Expression } from '..'
import { Token } from '../../lexer'
import { BlockStatement } from './block-statement'

export class IfExpression extends Expression {
    constructor(
        public token: Token,
        public condition: Expression | null = null,
        public consequence: BlockStatement | null = null,
        public alternative: BlockStatement | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        let out = 'if '

        out += this.condition?.toString()

        out += ' '

        out += this.consequence?.toString()

        if (this.alternative) {
            out += 'else '
            out += this.alternative.toString()
        }

        return out
    }
}
