import { CallExpression } from '../../ast/nodes/call-expression'
import { ExpressionStatement } from '../../ast/nodes/expression-statement'
import { parseTester } from './infix-expression.test'

test('call expression', () => {
    const input = `add(1, 2 * 3, 4 + 5);`

    const { program, parser } = parseTester(input)
    expect(program).not.toBeNull()
    expect(parser.errors.length).toBe(0)
    expect(program?.statements.length).toBe(1)
    expect(program.toString()).toBe('add(1, (2 * 3), (4 + 5))')

    const statement = program?.statements[0] as ExpressionStatement
    expect(statement).toBeInstanceOf(ExpressionStatement)
    expect(statement.exp).toBeInstanceOf(CallExpression)
})
