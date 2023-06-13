import { Statement } from '..'
import { Token } from '../../lexer'

export class BlockStatement extends Statement {
    constructor(public token: Token, public statements: Statement[] = []) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n')
    }
}
