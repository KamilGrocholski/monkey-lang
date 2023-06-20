import { Expression, Statement } from '..'
import { Token } from '../../lexer'
import { Identifier } from './identifier'

export class ConstStatement extends Statement {
    constructor(
        public token: Token,
        public name: Identifier | null = null,
        public value: Expression | null = null
    ) {
        super()
    }

    toString(): string {
        return `const ${this.name?.toString()} = ${this.value?.toString()};`
    }

    tokenLiteral(): string {
        return this.token.literal
    }
}
