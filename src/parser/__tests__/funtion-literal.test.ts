import Parser from '..'
import { BlockStatement } from '../../ast/nodes/block-statement'
import { Lexer } from '../../lexer'

test('function literal', () => {
    const input = `
fn(x, y) { x + y; }
`

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()
    expect(program.toString()).toBe('fn(x, y) { (x + y) }')
})
