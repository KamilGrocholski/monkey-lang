import { evalTester } from '../../eval/__tests__/eval.test'
import { Integer } from '../../objects'

test('array index expression', () => {
    const data: [string, unknown][] = [
        ['[1, 2, 3][0]', 1],
        ['[1, 2, 3][1]', 2],
        ['[1, 2, 3][2]', 3],
    ]

    data.forEach(([input, expected]) => {
        const { evaluated } = evalTester(input)
        if (typeof expected === 'number') {
            const int = evaluated as Integer
            expect(int).toBeInstanceOf(Integer)
            expect(int.value).toBe(expected)
        }
    })
})
