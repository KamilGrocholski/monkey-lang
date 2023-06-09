import {
    AstProgram,
    Expression,
    Identifier,
    IntegerLiteral,
    LetStatement,
    type Statement,
} from '../ast'
import { Lexer, TOKEN_KIND, type Token, type TokenKind } from '../lexer'

export class Parser {
    lexer: Lexer
    currentToken: Token
    peekToken: Token

    constructor(lexer: Lexer) {
        this.lexer = lexer

        this.currentToken = this.lexer.getNextToken()
        this.peekToken = this.lexer.getNextToken()
    }

    private nextToken(): void {
        this.currentToken = this.peekToken
        this.peekToken = this.lexer.getNextToken()
    }

    private currentTokenIs(kind: TokenKind): boolean {
        return this.currentToken.kind === kind
    }

    private peekTokenIs(kind: TokenKind): boolean {
        return this.peekToken.kind === kind
    }

    private expectPeek(kind: TokenKind): boolean {
        if (this.peekTokenIs(kind)) {
            this.nextToken()
            return true
        } else {
            return false
        }
    }

    parseProgram(): AstProgram {
        const program = new AstProgram()

        while (!this.currentTokenIs(TOKEN_KIND.Eof)) {
            let statement = this.parseStatement()
            if (statement !== null) {
                program.statements.push(statement)
            }
            this.nextToken()
        }

        return program
    }

    private parseStatement(): Statement | null {
        switch (this.currentToken.kind) {
            case TOKEN_KIND.Let:
                return this.parseLetStatement()
            default:
                return null
        }
    }

    private parseLetStatement(): LetStatement | null {
        const currentToken = this.currentToken

        if (!this.expectPeek(TOKEN_KIND.Ident)) {
            return null
        }

        const name = new Identifier(
            this.currentToken,
            this.currentToken.literal
        )

        if (!this.expectPeek(TOKEN_KIND.Assign)) {
            return null
        }

        this.nextToken()

        const statement = new LetStatement(
            currentToken,
            name,
            this.parseExpression()
        )

        while (!this.currentTokenIs(TOKEN_KIND.Semicolon)) {
            this.nextToken()
        }

        return statement
    }

    private parseIntegerLiteral(): IntegerLiteral {
        return new IntegerLiteral(
            this.currentToken,
            parseInt(this.currentToken.literal, 10)
        )
    }

    private parseExpression(): Expression {
        if (this.currentTokenIs(TOKEN_KIND.Int)) {
            return this.parseIntegerLiteral()
        }
        return this.parseIntegerLiteral()
    }
}
