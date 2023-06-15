import { Lexer, TOKEN_KIND, type Token } from '..'

test('it should tokenize a string', () => {
    const input = '=+(){},;'

    const lexer = new Lexer(input)

    const tokens = [
        TOKEN_KIND.Assign,
        TOKEN_KIND.Plus,
        TOKEN_KIND.LParen,
        TOKEN_KIND.RParen,
        TOKEN_KIND.LCurly,
        TOKEN_KIND.RCurly,
        TOKEN_KIND.Comma,
        TOKEN_KIND.Semicolon,
    ]

    for (const token of tokens) {
        expect(lexer.getNextToken().kind).toBe(token)
    }
})

test('test add function', () => {
    const input = `let five = 5;
        let ten = 10;
        let add = fn(x, y) {
            x + y;
        };
        let result = add(five, ten);
        !-/*5;
        5 < 10 > 5;
        if (5 < 10) {
            return true;
        } else {
            return false;
        }

        10 == 10;
        10 != 9;
        "foobar"
        "foo bar"
        `

    const lexer = new Lexer(input)

    const tokens: Token[] = [
        { kind: TOKEN_KIND.Let, literal: 'let' },
        { kind: TOKEN_KIND.Ident, literal: 'five' },
        { kind: TOKEN_KIND.Assign, literal: '=' },
        { kind: TOKEN_KIND.Int, literal: '5' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.Let, literal: 'let' },
        { kind: TOKEN_KIND.Ident, literal: 'ten' },
        { kind: TOKEN_KIND.Assign, literal: '=' },
        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.Let, literal: 'let' },
        { kind: TOKEN_KIND.Ident, literal: 'add' },
        { kind: TOKEN_KIND.Assign, literal: '=' },
        { kind: TOKEN_KIND.Function, literal: 'fn' },
        { kind: TOKEN_KIND.LParen, literal: '(' },
        { kind: TOKEN_KIND.Ident, literal: 'x' },
        { kind: TOKEN_KIND.Comma, literal: ',' },
        { kind: TOKEN_KIND.Ident, literal: 'y' },
        { kind: TOKEN_KIND.RParen, literal: ')' },
        { kind: TOKEN_KIND.LCurly, literal: '{' },
        { kind: TOKEN_KIND.Ident, literal: 'x' },
        { kind: TOKEN_KIND.Plus, literal: '+' },
        { kind: TOKEN_KIND.Ident, literal: 'y' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.RCurly, literal: '}' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.Let, literal: 'let' },
        { kind: TOKEN_KIND.Ident, literal: 'result' },
        { kind: TOKEN_KIND.Assign, literal: '=' },
        { kind: TOKEN_KIND.Ident, literal: 'add' },
        { kind: TOKEN_KIND.LParen, literal: '(' },
        { kind: TOKEN_KIND.Ident, literal: 'five' },
        { kind: TOKEN_KIND.Comma, literal: ',' },
        { kind: TOKEN_KIND.Ident, literal: 'ten' },
        { kind: TOKEN_KIND.RParen, literal: ')' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },

        { kind: TOKEN_KIND.Bang, literal: '!' },
        { kind: TOKEN_KIND.Minus, literal: '-' },
        { kind: TOKEN_KIND.Slash, literal: '/' },
        { kind: TOKEN_KIND.Asterisk, literal: '*' },
        { kind: TOKEN_KIND.Int, literal: '5' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.Int, literal: '5' },
        { kind: TOKEN_KIND.LessThan, literal: '<' },
        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.GreaterThan, literal: '>' },
        { kind: TOKEN_KIND.Int, literal: '5' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },

        { kind: TOKEN_KIND.If, literal: 'if' },
        { kind: TOKEN_KIND.LParen, literal: '(' },
        { kind: TOKEN_KIND.Int, literal: '5' },
        { kind: TOKEN_KIND.LessThan, literal: '<' },
        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.RParen, literal: ')' },
        { kind: TOKEN_KIND.LCurly, literal: '{' },
        { kind: TOKEN_KIND.Return, literal: 'return' },
        { kind: TOKEN_KIND.True, literal: 'true' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.RCurly, literal: '}' },
        { kind: TOKEN_KIND.Else, literal: 'else' },
        { kind: TOKEN_KIND.LCurly, literal: '{' },
        { kind: TOKEN_KIND.Return, literal: 'return' },
        { kind: TOKEN_KIND.False, literal: 'false' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.RCurly, literal: '}' },

        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.Equal, literal: '==' },
        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },
        { kind: TOKEN_KIND.Int, literal: '10' },
        { kind: TOKEN_KIND.NotEqual, literal: '!=' },
        { kind: TOKEN_KIND.Int, literal: '9' },
        { kind: TOKEN_KIND.Semicolon, literal: ';' },

        { kind: TOKEN_KIND.String, literal: 'foobar' },
        { kind: TOKEN_KIND.String, literal: 'foobar' },

        { kind: TOKEN_KIND.Eof, literal: 'eof' },
    ]

    for (const token of tokens) {
        const next = lexer.getNextToken()
        expect(next.kind).toBe(token.kind)
    }
})
