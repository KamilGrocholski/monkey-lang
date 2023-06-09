import { type Token } from '../lexer'

export type AstNodeKing = AstNode | Statement | Expression | AstProgram

export type AstNode = {
    tokenLiteral(): string
    toString(): string
}

export class AstProgram implements AstNode {
    constructor(public statements: Statement[] = []) {}

    tokenLiteral(): string {
        if (this.statements.length > 0) {
            return this.statements[0].tokenLiteral()
        } else {
            return ''
        }
    }

    toString(): string {
        return this.statements.map((s) => s.toString()).join('')
    }
}

export type Statement = {} & AstNode
export type Expression = {} & AstNode

export class LetStatement implements Statement {
    constructor(
        public token: Token,
        public name: Identifier,
        public value: Expression | Identifier
    ) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `${this.tokenLiteral()} ${this.name.toString()} = ${this.value.toString()};`
    }
}

export class Identifier implements Expression {
    constructor(public token: Token, public value: string) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.value
    }
}

export class IntegerLiteral implements Statement {
    constructor(public token: Token, public value: number) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return this.token.literal
    }
}

export class InfixExpression implements Expression {
    constructor(
        public token: Token,
        public left: Expression,
        public right: Expression | null,
        public operator: string
    ) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `${this.left.toString()} ${this.operator.toString()} ${
            this.right?.toString() ?? ''
        }`
    }
}

export class PrefixExpression implements Expression {
    constructor(
        public token: Token,
        public right: Expression,
        public operator: string
    ) {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        return `${this.operator}${this.right.toString()}`
    }
}
