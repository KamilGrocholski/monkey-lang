import { Expression } from '..'
import { Token } from '../../lexer'

export class Identifier extends Expression {
    constructor(token: Token, public value: string) {
        super(token)
    }

    toString(): string {
        return this.value
    }
}
