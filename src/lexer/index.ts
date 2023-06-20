export const TOKEN_KIND = {
    Illegal: 'ILLEGAL',
    Eof: 'EOF',

    Int: 'INT',
    String: 'STRING',
    Ident: 'IDENT',

    Colon: ':',
    Dot: '.',

    // Delimiters
    Semicolon: ';',
    Comma: ',',

    LParen: '(',
    RParen: ')',
    LCurly: '{',
    RCurly: '}',
    LSquare: '[',
    RSquare: ']',

    // Keywords
    Const: 'const',
    Let: 'let',
    Function: 'function',
    If: 'if',
    Else: 'else',
    Return: 'return',
    True: 'true',
    False: 'false',
    For: 'for',
    In: 'in',
    Null: 'null',

    Assign: '=',
    Equal: '==',
    NotEqual: '!=',

    // Operators
    Plus: '+',
    Minus: '-',
    Bang: '!',
    Asterisk: '*',
    Slash: '/',
    GreaterThan: '>',
    LessThan: '<',
} as const

export type TokenKind = (typeof TOKEN_KIND)[keyof typeof TOKEN_KIND]

export type Token = {
    kind: TokenKind
    literal: string
}

const _0 = '0'.charCodeAt(0)
const _9 = '9'.charCodeAt(0)

const a = 'a'.charCodeAt(0)
const z = 'z'.charCodeAt(0)

const A = 'A'.charCodeAt(0)
const Z = 'Z'.charCodeAt(0)

const _ = '_'.charCodeAt(0)

function isLetter(character: string): boolean {
    const char = character.charCodeAt(0)
    return (a <= char && z >= char) || (A <= char && Z >= char) || char === _
}

function isNumber(character: string): boolean {
    const char = character.charCodeAt(0)
    return _0 <= char && _9 >= char
}

function createToken(type: TokenKind, literal: string): Token {
    return { kind: type, literal }
}

export const KEYWORDS = {
    fn: createToken(TOKEN_KIND.Function, 'fn'),
    let: createToken(TOKEN_KIND.Let, 'let'),
    const: createToken(TOKEN_KIND.Const, 'const'),
    return: createToken(TOKEN_KIND.Return, 'return'),
    true: createToken(TOKEN_KIND.True, 'true'),
    false: createToken(TOKEN_KIND.False, 'false'),
    if: createToken(TOKEN_KIND.If, 'if'),
    else: createToken(TOKEN_KIND.Else, 'else'),
    for: createToken(TOKEN_KIND.For, 'for'),
    in: createToken(TOKEN_KIND.In, 'in'),
    null: createToken(TOKEN_KIND.Null, 'null'),
} as const

export class Lexer {
    private position: number = 0
    private readPosition: number = 0
    private ch!: string

    constructor(private input: string) {
        this.readChar()
    }

    public getNextToken(): Token {
        this.skipWhitespace()

        let token: Token | undefined
        switch (this.ch) {
            case '{':
                token = createToken(TOKEN_KIND.LCurly, this.ch)
                break
            case '}':
                token = createToken(TOKEN_KIND.RCurly, this.ch)
                break
            case '[':
                token = createToken(TOKEN_KIND.LSquare, this.ch)
                break
            case ']':
                token = createToken(TOKEN_KIND.RSquare, this.ch)
                break
            case '(':
                token = createToken(TOKEN_KIND.LParen, this.ch)
                break
            case ')':
                token = createToken(TOKEN_KIND.RParen, this.ch)
                break
            case ',':
                token = createToken(TOKEN_KIND.Comma, this.ch)
                break
            case '!':
                if (this.peek() === '=') {
                    this.readChar()
                    token = createToken(TOKEN_KIND.NotEqual, '!=')
                } else {
                    token = createToken(TOKEN_KIND.Bang, this.ch)
                }
                break
            case '>':
                token = createToken(TOKEN_KIND.GreaterThan, this.ch)
                break
            case '<':
                token = createToken(TOKEN_KIND.LessThan, this.ch)
                break
            case '*':
                token = createToken(TOKEN_KIND.Asterisk, this.ch)
                break
            case '/':
                token = createToken(TOKEN_KIND.Slash, this.ch)
                break
            case '-':
                token = createToken(TOKEN_KIND.Minus, this.ch)
                break
            case ';':
                token = createToken(TOKEN_KIND.Semicolon, this.ch)
                break
            case '+':
                token = createToken(TOKEN_KIND.Plus, this.ch)
                break
            case '=':
                if (this.peek() === '=') {
                    this.readChar()
                    token = createToken(TOKEN_KIND.Equal, '==')
                } else {
                    token = createToken(TOKEN_KIND.Assign, this.ch)
                }
                break
            case '"':
                token = createToken(TOKEN_KIND.String, this.readString())
                break
            case ':':
                token = createToken(TOKEN_KIND.Colon, this.ch)
                break
            case '\0':
                token = createToken(TOKEN_KIND.Eof, 'eof')
                break
        }

        if (isLetter(this.ch)) {
            const ident = this.readIdent()
            const keyword = KEYWORDS[ident as keyof typeof KEYWORDS]
            if (keyword) {
                return keyword
            } else {
                return createToken(TOKEN_KIND.Ident, ident)
            }
        } else if (isNumber(this.ch)) {
            return createToken(TOKEN_KIND.Int, this.readInt())
        } else if (!token) {
            return createToken(TOKEN_KIND.Illegal, this.ch)
        }

        this.readChar()
        return token as Token
    }

    private peek(): string {
        if (this.readPosition >= this.input.length) {
            return '\0'
        } else {
            return this.input[this.readPosition]
        }
    }

    private skipWhitespace(): void {
        while (
            this.ch === ' ' ||
            this.ch === '\t' ||
            this.ch === '\n' ||
            this.ch === '\r'
        ) {
            this.readChar()
        }
    }

    private readChar(): void {
        if (this.readPosition >= this.input.length) {
            this.ch = '\0'
        } else {
            this.ch = this.input[this.readPosition]
        }

        this.position = this.readPosition
        this.readPosition += 1
    }

    private readIdent(): string {
        const position = this.position

        while (isLetter(this.ch)) {
            this.readChar()
        }

        return this.input.slice(position, this.position)
    }

    private readInt(): string {
        const position = this.position

        while (isNumber(this.ch)) {
            this.readChar()
        }

        return this.input.slice(position, this.position)
    }

    private readString(): string {
        const position = this.position + 1

        this.readChar()

        while (this.ch !== '"') {
            if (this.ch === '\0') {
                break
            }
            this.readChar()
        }

        return this.input.slice(position, this.position)
    }
}
