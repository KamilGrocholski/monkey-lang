import Parser from '..'
import { Lexer } from '../../lexer'

test('identifier', () => {
    const input = 'foobar;'

    const l = new Lexer(input)
    const p = new Parser(l)
    const program = p.parseProgram()
    expect(program.toString()).toBe('foobar')
})
