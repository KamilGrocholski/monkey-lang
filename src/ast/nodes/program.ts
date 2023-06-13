import { AstNode, Statement } from '..'

export class Program extends AstNode {
    constructor() {
        super()
    }
    statements: Statement[] = []

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0]!.tokenLiteral()
        } else {
            return ''
        }
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('\n')
    }
}
