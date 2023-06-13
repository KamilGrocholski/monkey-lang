export abstract class AstNode {
    abstract tokenLiteral(): string

    abstract toString(): string
}

export abstract class Statement extends AstNode {
    constructor() {
        super()
    }

    statementNode(): void {}
}

export abstract class Expression extends AstNode {
    constructor() {
        super()
    }

    expressionNode(): void {}
}
