import { evaluate } from '..'
import { Program } from '../../ast/nodes/program'
import {
    Bool,
    Integer,
    Null,
    ErrorObj,
    OBJ_TYPE,
    Environment,
    Obj,
} from '../../objects'
import Parser from '../../parser'
import { parseTester } from '../../parser/__tests__/infix-expression.test'

export function evalTester(input: string): {
    program: Program
    parser: Parser
    evaluated: Obj | null
    env: Environment
} {
    const { program, parser } = parseTester(input)
    const env = new Environment()
    const evaluated = evaluate(program, env)

    return { program, parser, evaluated, env }
}

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
            const { evaluated } = evalTester(input)
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
            const { evaluated } = evalTester(input)
            expect(evaluated?.type).toBe(OBJ_TYPE.INTEGER)
            expect(evaluated).toBeInstanceOf(Integer)
            expect((evaluated as unknown as Integer).value).toBe(number)
        })
    })

    test('if else', () => {
        const data: [string, number | null][] = [
            ['if (true) { 10 }', 10],
            ['if (false) { 10 }', null],
            ['if (1) { 10 }', 10],
            ['if (1 < 2) { 10 }', 10],
            ['if (1 > 2) { 10 }', null],
            ['if (1 > 2) { 10 } else { 20 }', 20],
            ['if (1 < 2) { 10 } else { 20 }', 10],
        ]

        data.forEach(([input, result]) => {
            const { evaluated } = evalTester(input)
            if (result !== null) {
                expect(evaluated).toBeInstanceOf(Integer)
                expect((evaluated as unknown as Integer).value).toBe(result)
            } else {
                expect(evaluated).toBeInstanceOf(Null)
            }
        })
    })

    test('return', () => {
        const data: [string, number][] = [
            ['return 10;', 10],
            ['return 10; 9;', 10],
            ['return 2 * 5; 9;', 10],
            ['9; return 2 * 5; 9;', 10],
        ]

        data.forEach(([input, result]) => {
            const { evaluated } = evalTester(input)
            expect(evaluated).toBeInstanceOf(Integer)
            expect((evaluated as unknown as Integer).value).toBe(result)
        })
    })

    test('error handling', () => {
        const data: [string, string][] = [
            ['5 + true;', 'type mismatch: INTEGER + BOOL'],
            ['5 + true; 5;', 'type mismatch: INTEGER + BOOL'],
            ['-true', 'unknown operator: -BOOL'],
            ['true + false', 'unknown operator: BOOL + BOOL'],
            ['5; true + false; 5', 'unknown operator: BOOL + BOOL'],
            ['if (10 > 1) {true + false;}', 'unknown operator: BOOL + BOOL'],
            [
                `
            if (10 > 1) {
                if (10 > 1) {
                    return true + false;
                }

                return 1;
            }
            `,
                'unknown operator: BOOL + BOOL',
            ],
        ]

        data.forEach(([input, result]) => {
            const { evaluated } = evalTester(input)
            expect(evaluated).toBeInstanceOf(ErrorObj)
            expect((evaluated as unknown as ErrorObj).message).toBe(result)
        })
    })

    test('let', () => {
        const data: [string, string][] = [
            ['foobar', 'identifier not found: foobar'],
        ]

        data.forEach(([input, result]) => {
            const { evaluated } = evalTester(input)
            expect(evaluated).toBeInstanceOf(ErrorObj)
            expect((evaluated as unknown as ErrorObj).message).toBe(result)
        })
    })
})
