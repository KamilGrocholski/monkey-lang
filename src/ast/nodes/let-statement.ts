import { Expression, Statement } from '..'
import { Token } from '../../lexer'
import { Identifier } from './identifier'

export class LetStatement extends Statement {
    constructor(
        public token: Token,
        public name: Identifier | null = null,
        public value: Expression | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `let ${this.name?.toString()} = ${this.value?.toString()};`
    }
}
