import Parser from '..'
import { Lexer } from '../../lexer'

test('let-statement', () => {
    const input = `
let x = 5;
let y = 10;
let foobar = 838383;
`

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    expect(program.statements.length).toBe(3)
})
