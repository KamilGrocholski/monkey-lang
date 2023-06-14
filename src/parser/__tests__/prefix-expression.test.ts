import { TOKEN_KIND } from '../../lexer'
import { parseTester } from './infix-expression.test'

describe('prefix expression', () => {
    test.each([
        [
            '!5;',
            '(!5)',
            {
                operator: '!',
                right: {
                    token: {
                        literal: '5',
                        type: TOKEN_KIND.Int,
                    },
                    value: 5,
                },
                token: {
                    literal: '!',
                    type: TOKEN_KIND.Bang,
                },
            },
        ],
    ])('ahga', (input, string, token) => {
        const { program } = parseTester(input)
        expect(program.toString()).toBe(string)
    })
})
