import { evaluate } from '..'
import { Bool, Integer, OBJ_TYPE } from '../../objects'
import { parseTester } from '../../parser/__tests__/infix-expression.test'

describe('eval', () => {
    test('bang operator', () => {
        const data: [string, boolean][] = [
            ['!true', false],
            ['!false', true],
            ['!5', false],
            ['!!true', true],
            ['!!false', false],
            ['!!5', true],
        ]

        data.forEach(([input, bool]) => {
            const { program } = parseTester(input)
            const evaluated = evaluate(program)
            expect(evaluated?.type).toBe(OBJ_TYPE.BOOL)
            expect(evaluated).toBeInstanceOf(Bool)
            expect((evaluated as unknown as Bool).value).toBe(bool)
        })
    })

    test('integer', () => {
        const data: [string, number][] = [
            ['5', 5],
            ['10', 10],
            ['-5', -5],
            ['-10', -10],
            ['5', 5],
            ['10', 10],
            ['-5', -5],
            ['-10', -10],
            ['5 + 5 + 5 + 5 - 10', 10],
            ['2 * 2 * 2 * 2 * 2', 32],
            ['-50 + 100 + -50', 0],
            ['5 * 2 + 10', 20],
            ['5 + 2 * 10', 25],
            ['20 + 2 * -10', 0],
            ['50 / 2 * 2 + 10', 60],
            ['2 * (5 + 10)', 30],
            ['3 * 3 * 3 + 10', 37],
            ['3 * (3 * 3) + 10', 37],
            ['(5 + 10 * 2 + 15 / 3) * 2 + -10', 50],
        ]

        data.forEach(([input, number]) => {
            const { program } = parseTester(input)
            const evaluated = evaluate(program)
            expect(evaluated?.type).toBe(OBJ_TYPE.INTEGER)
            expect(evaluated).toBeInstanceOf(Integer)
            expect((evaluated as unknown as Integer).value).toBe(number)
        })
    })
})
