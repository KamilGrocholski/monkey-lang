import Parser from '..'
import { Program } from '../../ast/nodes/program'
import { Lexer, TOKEN_KIND } from '../../lexer'

export const parseTester = (
    input: string
): { parser: Parser; program: Program } => {
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    return {
        parser,
        program: parser.parseProgram(),
    }
}

describe('infix', () => {
    test.each([
        [
            '5 + 5;',
            '(5 + 5)',
            {
                left: {
                    token: {
                        literal: '5',
                        type: TOKEN_KIND.Int,
                    },
                    value: 5,
                },
                operator: '+',
                right: {
                    token: {
                        literal: '5',
                        type: TOKEN_KIND.Int,
                    },
                    value: 5,
                },
            },
        ],
    ])('infix: success', (input, string, token) => {
        const { program } = parseTester(input)
        expect(program.toString()).toBe(string)
    })
})
