import { Token } from '../lexer'

export abstract class AstNode {
    constructor(public readonly token: Token) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    abstract toString(): string
}

export abstract class Statement extends AstNode {
    constructor(token: Token) {
        super(token)
    }

    statementNode(): void {}
}

export abstract class Expression extends AstNode {
    constructor(token: Token) {
        super(token)
    }

    expressionNode(): void {}
}
