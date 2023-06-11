import { Expression, Statement } from '..'
import { Token } from '../../lexer'
import { Identifier } from './identifier'

export class LetStatement extends Statement {
    constructor(
        token: Token,
        public name: Identifier | null = null,
        public value: Expression | null = null
    ) {
        super(token)
    }

    toString(): string {
        return `let ${this.name?.toString()} = ${this.value?.toString()};`
    }
}
