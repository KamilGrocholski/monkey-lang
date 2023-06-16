import Parser from '..'
import { Lexer } from '../../lexer'

test('index expression', () => {
    const input = 'myArray[1+1]'

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    expect(parser.errors.length).toBe(0)

    // TODO
})
