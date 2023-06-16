import { ExpressionStatement } from '../../ast/nodes/expression-statement'
import { HashLiteral } from '../../ast/nodes/hash-literal'
import { IntegerLiteral } from '../../ast/nodes/integer-literal'
import { parseTester } from './infix-expression.test'

test('hash literal non empty', () => {
    const input = '{"one": 1, "two": 2, "three": 3}'

    const { program, parser } = parseTester(input)

    expect(parser.errors.length).toBe(0)
    const stmt = program.statements[0] as ExpressionStatement
    expect(stmt).toBeInstanceOf(ExpressionStatement)
    const hash = stmt.exp as HashLiteral
    expect(hash).toBeInstanceOf(HashLiteral)

    const expected = [
        ['one', 1],
        ['two', 2],
        ['three', 3],
    ]

    Object.entries(hash.pairs).forEach(([key, obj], i) => {
        expect(key).toBe(expected[i])
        if (obj instanceof IntegerLiteral) {
            expect(obj.value).toBe(expected[i])
        } else {
            throw new Error('wrong type for testing')
        }
    })
})

test('hash literal empty', () => {
    const input = '{}'

    const { program, parser } = parseTester(input)

    expect(parser.errors.length).toBe(0)
    const stmt = program.statements[0] as ExpressionStatement
    expect(stmt).toBeInstanceOf(ExpressionStatement)
    const hash = stmt.exp as HashLiteral
    expect(hash).toBeInstanceOf(HashLiteral)
    const pairs = Object.entries(hash.pairs)
    expect(pairs.length).toBe(0)
})
