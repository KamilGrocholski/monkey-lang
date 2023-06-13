import { evaluate } from '..'
import { Bool, OBJ_TYPE } from '../../objects'
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
})
