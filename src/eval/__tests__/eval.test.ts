import { evaluate } from '..'
import { Program } from '../../ast/nodes/program'
import {
    Bool,
    Integer,
    String,
    ErrorObj,
    OBJ_TYPE,
    Environment,
    Obj,
    FunctionObject,
    Null,
    Hash,
    HashKey,
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

function testIntegerObject(input: string, expected: number) {
    const { evaluated } = evalTester(input)
    expect(evaluated).toBeInstanceOf(Integer)
    expect(evaluated?.type).toBe(OBJ_TYPE.INTEGER)
    const int = evaluated as Integer
    expect(int.value).toBe(expected)
}

function testStringObject(input: string, expected: string) {
    const { evaluated } = evalTester(input)
    expect(evaluated).toBeInstanceOf(String)
    expect(evaluated?.type).toBe(OBJ_TYPE.STRING)
    const errorObj = evaluated as String
    expect(errorObj.value).toBe(expected)
}

function testBoolObject(input: string, expected: boolean) {
    const { evaluated } = evalTester(input)
    expect(evaluated).toBeInstanceOf(Bool)
    expect(evaluated?.type).toBe(OBJ_TYPE.BOOL)
    const int = evaluated as Bool
    expect(int.value).toBe(expected)
}

function testNullObject(input: string) {
    const { evaluated } = evalTester(input)
    expect(evaluated).toBeInstanceOf(Null)
    expect(evaluated?.type).toBe(OBJ_TYPE.NULL)
}

function testErrorObject(input: string, expected: string) {
    const { evaluated } = evalTester(input)
    expect(evaluated).toBeInstanceOf(ErrorObj)
    expect(evaluated?.type).toBe(OBJ_TYPE.ERROR)
    const errorObj = evaluated as ErrorObj
    expect(errorObj.message).toBe(expected)
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

        data.forEach(([input, expected]) => {
            testBoolObject(input, expected)
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

        data.forEach(([input, expected]) => {
            testIntegerObject(input, expected)
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
            if (result !== null) {
                testIntegerObject(input, result)
            } else {
                testNullObject(input)
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

        data.forEach(([input, expected]) => {
            testIntegerObject(input, expected)
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
            ['"Hello" - "World"', 'unknown operator: STRING - STRING'],
        ]

        data.forEach(([input, expected]) => {
            testErrorObject(input, expected)
        })
    })

    test('let', () => {
        const data: [string, string][] = [
            ['foobar', 'identifier not found: foobar'],
        ]

        data.forEach(([input, expected]) => {
            testErrorObject(input, expected)
        })
    })

    test('function literal', () => {
        const input = `fn(x) {x + 2;};`

        const { evaluated } = evalTester(input)
        expect(evaluated).toBeInstanceOf(FunctionObject)
        const functionObj = evaluated as FunctionObject
        expect(functionObj.params.length).toBe(1)
        expect(functionObj.params[0].toString()).toBe('x')
        expect(functionObj.body.toString()).toBe('(x + 2)')
    })

    test('function application', () => {
        const data: [string, number][] = [
            ['let identity = fn(x) { x; }; identity(5);', 5],
            ['let identity = fn(x) { return x; }; identity(5);', 5],
            ['let double = fn(x) { x * 2; }; double(5);', 10],
            ['let add = fn(x, y) { x + y; }; add(5, 5);', 10],
            ['let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', 20],
            ['fn(x) { x; }(5)', 5],
        ]

        data.forEach(([input, expected]) => {
            testIntegerObject(input, expected)
        })
    })

    test('closures', () => {
        const input = `
let newAdder = fn(x) {
    fn (y) {x + y};
};
let addTwo = newAdder(2)
addTwo(2)
`

        testIntegerObject(input, 4)
    })

    test('string literal', () => {
        const input = '"Hello World!"'
        testStringObject(input, 'Hello World!')
    })

    test('builtin functions', () => {
        const data: [string, unknown][] = []

        data.forEach(([input, expected]) => {
            if (typeof expected === 'number') {
                testIntegerObject(input, expected)
                return
            }
            if (typeof expected === 'string') {
                testErrorObject(input, expected)
                return
            }
        })
    })

    test('hash', () => {
        const letINput = 'let two = "two";'
        const hashInput =
            '{"one": 10 - 9, two: 1 +1, "thr" + "ee": 6 / 2, 4: 4, true: 5, false: 6}'
        const input = letINput + hashInput

        const { evaluated } = evalTester(input)

        const res = evaluated as Obj
        const hash = res as Hash
        expect(hash).toBeInstanceOf(Hash)
        const pairs = Object.entries(hash.pairs)
        expect(pairs.length).toBe(6)

        const expected: [string, number][] = [
            [HashKey.createKey(OBJ_TYPE.STRING, String.hash('one')), 1],
            [HashKey.createKey(OBJ_TYPE.STRING, String.hash('two')), 2],
            [HashKey.createKey(OBJ_TYPE.STRING, String.hash('three')), 3],
            [HashKey.createKey(OBJ_TYPE.INTEGER, Integer.hash(4)), 4],
            [HashKey.createKey(OBJ_TYPE.BOOL, Bool.hash(true)), 5],
            [HashKey.createKey(OBJ_TYPE.BOOL, Bool.hash(false)), 6],
        ]

        pairs.forEach(([key, value], i) => {
            const int = value as Integer
            expect(int).toBeInstanceOf(Integer)
            expect(int.value).toBe(expected[i][1])
            expect(key).toBe(expected[i][0])
        })
    })

    test('hash index', () => {
        const data: [string, unknown][] = [
            ['{"foo": 5}["foo"]', 5],
            ['{"foo": 5}["bar"]', null],
        ]

        data.forEach(([input, expected]) => {
            if (typeof expected === 'number') {
                testIntegerObject(input, expected as number)
            } else {
                const { evaluated } = evalTester(input)
                expect(evaluated).toBeNull()
            }
        })
    })
})
