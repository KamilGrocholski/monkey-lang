import { Expression } from '..'
import { Token } from '../../lexer'
import { BlockStatement } from './block-statement'
import { Identifier } from './identifier'

export class ForExpression extends Expression {
    constructor(
        public token: Token,
        public index: Identifier,
        public value: Identifier,
        public target: Identifier,
        public body: BlockStatement
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        let block = this.body?.toString()
        if (block?.length) {
            block = `{ ${this.body?.toString()} }`
        } else {
            block = '{}'
        }

        return `for(${
            (this.index.toString(), this.value.toString())
        } in ${this.target?.toString()}) ${block}`
    }
}
