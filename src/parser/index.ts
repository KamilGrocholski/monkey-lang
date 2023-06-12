import { Expression, Statement } from '../ast'
import { ExpressionStatement } from '../ast/nodes/expression-statement'
import { Identifier } from '../ast/nodes/identifier'
import { InfixExpression } from '../ast/nodes/infix-expression'
import { IntegerLiteral } from '../ast/nodes/integer-literal'
import { LetStatement } from '../ast/nodes/let-statement'
import { PrefixExpression } from '../ast/nodes/prefix-expression'
import { Program } from '../ast/nodes/program'
import { ReturnStatement } from '../ast/nodes/return-statement'
import { Lexer, TOKEN_KIND, Token, TokenKind } from '../lexer'

type PrefixParseFn = () => Expression | null
type InfixParseFn = (exp: Expression) => Expression | null

const enum Precedence {
    LOWEST = 1,
    EQUALS,
    LESSGREATER,
    SUM,
    PRODUCT,
    PREFIX,
    CALL,
}

const precedences: { [key: string]: number } = {
    [TOKEN_KIND.Equal]: Precedence.EQUALS,
    [TOKEN_KIND.NotEqual]: Precedence.EQUALS,
    [TOKEN_KIND.LessThan]: Precedence.LESSGREATER,
    [TOKEN_KIND.GreaterThan]: Precedence.LESSGREATER,
    [TOKEN_KIND.Plus]: Precedence.SUM,
    [TOKEN_KIND.Minus]: Precedence.SUM,
    [TOKEN_KIND.Slash]: Precedence.PRODUCT,
    [TOKEN_KIND.Asterisk]: Precedence.PRODUCT,
}

export default class Parser {
    private currentToken: Token
    private peekToken: Token

    private prefixParseFns: { [key: string]: PrefixParseFn } = {}
    private infixParseFns: { [key: string]: InfixParseFn } = {}

    errors: string[] = []

    constructor(private lexer: Lexer) {
        this.registerPrefix(TOKEN_KIND.Ident, this.parseIdentifier)
        this.registerPrefix(TOKEN_KIND.Int, this.parseIntegerLiteral)
        this.registerPrefix(TOKEN_KIND.Bang, this.parsePrefixExpression)
        this.registerPrefix(TOKEN_KIND.Minus, this.parsePrefixExpression)

        this.registerInfix(TOKEN_KIND.Plus, this.parseInfixExpression)

        this.currentToken = this.lexer.getNextToken()
        this.peekToken = this.lexer.getNextToken()
    }

    parseProgram(): Program {
        const program = new Program()

        while (!this.currentTokenIs(TOKEN_KIND.Eof)) {
            const statement = this.parseStatement()
            if (statement) {
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
            case TOKEN_KIND.Return:
                return this.parseReturnStatement()
            default:
                return this.parseExpressionStatement()
        }
    }

    private parseLetStatement(): LetStatement | null {
        const statement = new LetStatement(this.currentToken)

        if (!this.expectPeek(TOKEN_KIND.Ident)) {
            return null
        }

        statement.name = new Identifier(
            this.currentToken,
            this.currentToken.literal
        )

        if (!this.expectPeek(TOKEN_KIND.Assign)) {
            return null
        }

        this.nextToken()
        statement.value = this.parseExpression(Precedence.LOWEST)

        if (this.peekTokenIs(TOKEN_KIND.Semicolon)) {
            this.nextToken()
        }

        return statement
    }

    private parseReturnStatement(): ReturnStatement | null {
        const statement = new ReturnStatement(this.currentToken)

        this.nextToken()

        statement.returnValue = this.parseExpression(Precedence.LOWEST)

        if (this.peekTokenIs(TOKEN_KIND.Semicolon)) {
            this.nextToken()
        }

        return statement
    }

    private parseIntegerLiteral(): IntegerLiteral | null {
        const value = parseInt(this.currentToken.literal, 10)

        if (isNaN(value)) {
            return null
        }

        return new IntegerLiteral(this.currentToken, value)
    }

    private parseIdentifier(): Identifier {
        return new Identifier(this.currentToken, this.currentToken.literal)
    }

    private parseExpression(precedence: Precedence): Expression | null {
        const prefixFn = this.prefixParseFns[this.currentToken.kind]
        if (!prefixFn) {
            return null
        }
        let leftExp = prefixFn()

        while (
            !this.peekTokenIs(TOKEN_KIND.Semicolon) &&
            precedence < this.peekPrecedence()
        ) {
            const infixFn = this.infixParseFns[this.currentToken.kind]
            if (!infixFn) {
                return null
            }

            this.nextToken()

            if (leftExp) {
                leftExp = infixFn(leftExp)
            }
        }

        return leftExp
    }

    private parseExpressionStatement(): ExpressionStatement | null {
        const statement = new ExpressionStatement(
            this.currentToken,
            this.parseExpression(Precedence.LOWEST)
        )

        if (this.peekTokenIs(TOKEN_KIND.Semicolon)) {
            this.nextToken()
        }

        return statement
    }

    private parsePrefixExpression(): PrefixExpression {
        const exp = new PrefixExpression(
            this.currentToken,
            this.currentToken.literal
        )
        this.nextToken()
        exp.right = this.parseExpression(Precedence.PREFIX)

        return exp
    }

    private parseInfixExpression(leftExp: Expression | null): InfixExpression {
        const exp = new InfixExpression(
            this.currentToken,
            this.currentToken.literal,
            leftExp
        )
        const precedence = this.currentPrecedence()
        this.nextToken()
        exp.right = this.parseExpression(precedence)

        return exp
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
            this.peekError(kind)
            return false
        }
    }

    private peekError(kind: TokenKind): void {
        this.errors.push(`expected ${kind} got ${this.currentToken.kind}`)
    }

    private registerPrefix(kind: TokenKind, fn: PrefixParseFn): void {
        this.prefixParseFns[kind] = fn.bind(this) // must use 'bind(this)'
    }

    private registerInfix(kind: TokenKind, fn: InfixParseFn): void {
        this.infixParseFns[kind] = fn.bind(this) // must use 'bind(this)'
    }

    private currentPrecedence(): Precedence {
        return precedences[this.currentToken.kind] ?? Precedence.LOWEST
    }

    private peekPrecedence(): Precedence {
        return precedences[this.peekToken.kind] ?? Precedence.LOWEST
    }
}
