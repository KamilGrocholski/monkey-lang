import { Expression } from '..'
import { Token } from '../../lexer'
import { BlockStatement } from './block-statement'
import { Identifier } from './identifier'

export class FunctionLiteral extends Expression {
    constructor(
        public token: Token,
        public parameters: Identifier[] | null = null,
        public body: BlockStatement | null = null
    ) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        const params = this.parameters?.map((p) => p.toString()).join(', ')

        let block = this.body?.toString()
        if (block?.length) {
            block = `{ ${this.body?.toString()} }`
        } else {
            block = '{}'
        }

        return `${this.tokenLiteral()}(${params}) ${block}`
    }
}
