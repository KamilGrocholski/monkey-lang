import Parser from '..'
import { Lexer } from '../../lexer'

test('integer literal', () => {
    const input = '5;'

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    expect(program.statements.length).toBe(1)
    expect(program.statements[0].toString()).toBe('5')
})
