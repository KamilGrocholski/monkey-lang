import { Expression, Statement } from '..'
import { Token } from '../../lexer'

export class ReturnStatement extends Statement {
    constructor(token: Token, public returnValue: Expression | null = null) {
        super(token)
    }

    toString(): string {
        return `return ${this.returnValue?.toString()};`
    }
}
