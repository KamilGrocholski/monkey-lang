import Parser from '..'
import { ExpressionStatement } from '../../ast/nodes/expression-statement'
import { StringLiteral } from '../../ast/nodes/string-literal'
import { Lexer } from '../../lexer'

test('string literal', () => {
    const input = '"hello world";'

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    expect(parser.errors.length).toBe(0)
    const stmt = program.statements[0] as ExpressionStatement
    const literal = stmt.exp as StringLiteral
    expect(literal.value).toBe('hello world')
})
