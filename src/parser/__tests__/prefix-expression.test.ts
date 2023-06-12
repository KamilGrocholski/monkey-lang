import Parser from '..'
import { ExpressionStatement } from '../../ast/nodes/expression-statement'
import { IntegerLiteral } from '../../ast/nodes/integer-literal'
import { PrefixExpression } from '../../ast/nodes/prefix-expression'
import { Lexer } from '../../lexer'

test('prefix expression', () => {
    const data = [
        { input: '!5;', operator: '!', int: 5 },
        { input: '-15;', operator: '-', int: 15 },
    ]

    data.forEach((d) => {
        const l = new Lexer(d.input)
        const p = new Parser(l)
        const program = p.parseProgram()

        console.log(program.statements)
        expect(program.statements.length).toBe(1)
        expect(program.statements[0] instanceof ExpressionStatement).toBe(true)
        const s = program.statements[0] as unknown as ExpressionStatement
        expect(s.exp instanceof PrefixExpression).toBe(true)
        const prefixExp = s.exp as unknown as PrefixExpression
        expect(prefixExp.operator).toBe(d.operator)
        expect(prefixExp.right instanceof IntegerLiteral).toBe(true)
        const right = prefixExp.right as unknown as IntegerLiteral
        expect(right.value).toBe(d.int)
    })
})
