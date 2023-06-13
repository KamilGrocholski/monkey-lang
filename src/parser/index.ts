import { Expression, Statement } from '../ast'
import { BlockStatement } from '../ast/nodes/block-statement'
import { BooleanLiteral } from '../ast/nodes/boolean-literal'
import { CallExpression } from '../ast/nodes/call-expression'
import { ExpressionStatement } from '../ast/nodes/expression-statement'
import { FunctionLiteral } from '../ast/nodes/function-literal'
import { Identifier } from '../ast/nodes/identifier'
import { IfExpression } from '../ast/nodes/if-expression'
import { InfixExpression } from '../ast/nodes/infix-expression'
import { IntegerLiteral } from '../ast/nodes/integer-literal'
import { LetStatement } from '../ast/nodes/let-statement'
import { PrefixExpression } from '../ast/nodes/prefix-expression'
import { Program } from '../ast/nodes/program'
import { ReturnStatement } from '../ast/nodes/return-statement'
import { StringLiteral } from '../ast/nodes/string-literal'
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
        this.registerPrefix(TOKEN_KIND.True, this.parseBoolean)
        this.registerPrefix(TOKEN_KIND.False, this.parseBoolean)
        this.registerPrefix(TOKEN_KIND.LParen, this.parseGroupExpression)
        this.registerPrefix(TOKEN_KIND.If, this.parseIfExpression)
        this.registerPrefix(TOKEN_KIND.Function, this.parseFunctionLiteral)
        this.registerPrefix(TOKEN_KIND.String, this.parseStringLiteral)

        this.registerInfix(TOKEN_KIND.Plus, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.Minus, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.Slash, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.Asterisk, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.Equal, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.NotEqual, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.LessThan, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.GreaterThan, this.parseInfixExpression)
        this.registerInfix(TOKEN_KIND.LParen, this.parseCallExpression)
        // this.registerInfix(TOKEN_KIND.RParen, this.parseIndexExpression)

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

    private parseBoolean(): Expression {
        return new BooleanLiteral(
            this.currentToken,
            this.currentTokenIs(TOKEN_KIND.True)
        )
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
            const infixFn = this.infixParseFns[this.peekToken.kind]
            if (!infixFn) {
                return leftExp
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

    private parseGroupExpression(): Expression | null {
        this.nextToken()

        const exp = this.parseExpression(Precedence.LOWEST)

        if (!this.expectPeek(TOKEN_KIND.RParen)) {
            return null
        }

        return exp
    }

    private parseFunctionLiteral(): FunctionLiteral | null {
        const literal = new FunctionLiteral(this.currentToken)

        if (!this.expectPeek(TOKEN_KIND.LParen)) {
            return null
        }

        literal.parameters = this.parseFunctionParameters()

        if (!this.expectPeek(TOKEN_KIND.LCurly)) {
            return null
        }

        literal.body = this.parseBlockStatement()

        return literal
    }

    private parseFunctionParameters(): Identifier[] | null {
        const identifiers: Identifier[] = []

        if (this.peekTokenIs(TOKEN_KIND.RParen)) {
            this.nextToken()
            return identifiers
        }

        this.nextToken()

        const ident = new Identifier(
            this.currentToken,
            this.currentToken.literal
        )
        identifiers.push(ident)

        while (this.peekTokenIs(TOKEN_KIND.Comma)) {
            this.nextToken()
            this.nextToken()
            const ident = new Identifier(
                this.currentToken,
                this.currentToken.literal
            )
            identifiers.push(ident)
        }

        if (!this.expectPeek(TOKEN_KIND.RParen)) {
            return null
        }

        return identifiers
    }

    private parseStringLiteral(): StringLiteral {
        return new StringLiteral(this.currentToken, this.currentToken.literal)
    }

    private parseCallExpression(fn: Expression | null): CallExpression | null {
        const exp = new CallExpression(this.currentToken, fn)

        exp.args = this.parseCallArguments()

        return exp
    }

    private parseCallArguments(): Expression[] | null {
        const args: Expression[] = []

        if (this.peekTokenIs(TOKEN_KIND.RParen)) {
            this.nextToken()
            return args
        }

        this.nextToken()
        const exp = this.parseExpression(Precedence.LOWEST)
        if (exp) {
            args.push(exp)
        }

        while (this.peekTokenIs(TOKEN_KIND.Comma)) {
            this.nextToken()
            this.nextToken()

            const exp = this.parseExpression(Precedence.LOWEST)

            if (exp) {
                args.push(exp)
            }
        }

        if (!this.expectPeek(TOKEN_KIND.RParen)) {
            return null
        }

        return args
    }

    private parseBlockStatement(): BlockStatement | null {
        const block = new BlockStatement(this.currentToken)

        this.nextToken()

        while (
            !this.currentTokenIs(TOKEN_KIND.RCurly) &&
            !this.currentTokenIs(TOKEN_KIND.Eof)
        ) {
            const innerStatement = this.parseStatement()
            if (innerStatement) {
                block.statements.push(innerStatement)
            }
            this.nextToken()
        }

        return block
    }

    private parseIfExpression(): IfExpression | null {
        const exp = new IfExpression(this.currentToken)

        if (!this.expectPeek(TOKEN_KIND.LParen)) {
            return null
        }

        this.nextToken()

        exp.condition = this.parseExpression(Precedence.LOWEST)

        if (!this.expectPeek(TOKEN_KIND.RParen)) {
            return null
        }

        if (!this.expectPeek(TOKEN_KIND.LCurly)) {
            return null
        }

        exp.consequence = this.parseBlockStatement()

        // no need for RCurly check - done in parseBlockStatement

        if (this.peekTokenIs(TOKEN_KIND.Else)) {
            this.nextToken()

            if (!this.expectPeek(TOKEN_KIND.LCurly)) {
                return null
            }

            exp.alternative = this.parseBlockStatement()

            // no need for RCurly check - done in parseBlockStatement
        }

        return exp
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

    private parseInfixExpression(leftExp: Expression): InfixExpression {
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
