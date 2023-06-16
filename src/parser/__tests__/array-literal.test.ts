import Parser from '..'
import { Expression } from '../../ast'
import { ArrayLiteral } from '../../ast/nodes/array-literal'
import { ExpressionStatement } from '../../ast/nodes/expression-statement'
import { InfixExpression } from '../../ast/nodes/infix-expression'
import { IntegerLiteral } from '../../ast/nodes/integer-literal'
import { Lexer } from '../../lexer'

test('array literal', () => {
    const input = '[1,2 * 2, 3 + 3]'

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    expect(parser.errors.length).toBe(0)
    const stmt = program.statements[0] as ExpressionStatement
    expect(stmt).toBeInstanceOf(ExpressionStatement)
    const array = stmt.exp as ArrayLiteral
    expect(array).toBeInstanceOf(ArrayLiteral)
    expect(array.elements?.length).toBe(3)
    const elements = array.elements as Expression[]

    const el1 = elements[0] as unknown as IntegerLiteral
    expect(el1.value).toBe(1)

    const el2 = elements[1] as unknown as InfixExpression
    const left2 = el2.left as IntegerLiteral
    const right2 = el2.right as IntegerLiteral
    expect(left2.value).toBe(2)
    expect(el2.operator).toBe('*')
    expect(right2.value).toBe(2)

    const el3 = elements[2] as unknown as InfixExpression
    const left3 = el3.left as IntegerLiteral
    const right3 = el3.right as IntegerLiteral
    expect(left3.value).toBe(3)
    expect(el3.operator).toBe('+')
    expect(right3.value).toBe(3)
})
