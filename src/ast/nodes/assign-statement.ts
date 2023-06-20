import { Expression } from '..'
import { Token } from '../../lexer'
import { Identifier } from './identifier'

export class AssignExpression extends Expression {
    constructor(
        public token: Token,
        public name: Identifier,
        public operator: string,
        public value: Expression
    ) {
        super()
    }

    toString(): string {
        return ''
    }

    tokenLiteral(): string {
        return this.token.literal
    }
}
