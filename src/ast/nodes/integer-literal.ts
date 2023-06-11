import { Expression } from '..'
import { Token } from '../../lexer'

export class IntegerLiteral extends Expression {
    constructor(token: Token, public value: number) {
        super(token)
    }

    toString(): string {
        return this.token.literal
    }
}
