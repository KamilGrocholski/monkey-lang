import { parseTester } from './infix-expression.test'

describe('boolean', () => {
    test.each([
        ['true', 'true'],
        ['false', 'false'],
        ['3 > 5 == false', '((3 > 5) == false)'],
        ['3 < 5 == true', '((3 < 5) == true)'],
    ])('', (input, string) => {
        const { parser, program } = parseTester(input)
        expect(parser.errors.length).toBe(0)
        expect(program.toString()).toBe(string)
    })
})
