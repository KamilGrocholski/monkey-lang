import Parser from '..'
import { Lexer } from '../../lexer'

test('return', () => {
    const input = `
return 2;
return 3;
return 10;
`

    const lexer = new Lexer(input)
    const parse = new Parser(lexer)
    const program = parse.parseProgram()

    const expected = ['return 2;', 'return 3;', 'return 10;']

    expect(program.statements.length).toBe(3)

    program.statements.forEach((s, i) => {
        expect(s.toString()).toBe(expected[i])
    })
})
