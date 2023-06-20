import { BlockStatement } from '../ast/nodes/block-statement'
import { HashLiteralKey } from '../ast/nodes/hash-literal'
import { Identifier } from '../ast/nodes/identifier'

export type ObjType = (typeof OBJ_TYPE)[keyof typeof OBJ_TYPE]
export const OBJ_TYPE = {
    INTEGER: 'INTEGER',
    BOOL: 'BOOL',
    NULL: 'NULL',
    STRING: 'STRING',
    RETURN_VALUE: 'RETURN_VALUE',
    ERROR: 'ERROR',
    ENVIRONMENT: 'ENVIRONMENT',
    FUNCTION: 'FUNCTION',
    BUILTIN: 'BUILTIN',
    ARRAY: 'ARRAY',
    HASH: 'HASH',
    FOR: 'FOR',
} as const

export interface Obj {
    toHashKey?(): HashLiteralKey
}

export abstract class Obj {
    abstract get type(): ObjType
    abstract inspect(): string
}

export class Bool extends Obj {
    constructor(public value: boolean) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.BOOL
    }

    inspect(): string {
        return `${this.value}`
    }

    toHashKey(): HashLiteralKey {
        const hashedValue = Bool.hash(this.value)

        return HashKey.createKey(hashedValue)
    }

    static hash(input: boolean): string {
        return `${input ? 1 : 0}`
    }
}

export const TRUE = new Bool(true)
export const FALSE = new Bool(false)

export class Integer extends Obj {
    constructor(public value: number) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.INTEGER
    }

    inspect(): string {
        return this.value.toString()
    }

    toHashKey(): HashLiteralKey {
        const hashedValue = Integer.hash(this.value)

        return HashKey.createKey(hashedValue)
    }

    static hash(input: number): string {
        return input.toString()
    }
}

export class String extends Obj {
    constructor(public value: string) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.STRING
    }

    inspect(): string {
        return this.value
    }

    toHashKey(): HashLiteralKey {
        const hashedValue = String.hash(this.value)

        return HashKey.createKey(hashedValue)
    }

    static hash(input: string): string {
        return input
    }
}

export class Null extends Obj {
    constructor() {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.NULL
    }

    inspect(): string {
        return 'null'
    }
}
export const NULL = new Null()

export class ReturnValue extends Obj {
    constructor(public value: Obj) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.RETURN_VALUE
    }

    inspect(): string {
        return this.value.inspect()
    }
}

export class ErrorObj extends Obj {
    constructor(public message: string) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.ERROR
    }

    inspect(): string {
        return `ERROR: ${this.message}`
    }

    static createAlreadyAssignedError(name: string) {
        return new ErrorObj(
            `AlreadyAssignedError: '${name}' is already assigned`
        )
    }
    static createConstantReassignError(name: string) {
        return new ErrorObj(
            `ConstantReassignError: trying to reassign constant '${name}'`
        )
    }
    static createObjectRequiredError(actionName: string, name: string) {
        return new ErrorObj(
            `ObjectRequiredError: object '${name}' must not be 'null' for '${actionName}'`
        )
    }
    static createIdentifierNotFoundError(name: string) {
        return new ErrorObj(
            `IdentifierNotFoundError: ident named '${name}' is not found`
        )
    }
    static createTypeMismatchError(data: {
        expected: { left: ObjType; right: ObjType }
        got: { left?: null | ObjType; right?: null | ObjType }
    }) {
        return new ErrorObj(
            `TypeMismatchError: \texpected '${data.expected.left}' and '${data.expected.right}', \tgot '${data.got.left}' and '${data.got.right}'`
        )
    }
    static createTypeError(expected: ObjType | 'any', got?: ObjType | null) {
        return new ErrorObj(`TypeError: expected '${expected}', got '${got}'`)
    }
    static createArgsLengthError(expected: number, got: number) {
        return new ErrorObj(
            `ArgsLengthError: expected '${expected}', got '${got}'`
        )
    }
    static createTypeNotSupportedError(
        actionName: string,
        got?: ObjType | null
    ) {
        return new ErrorObj(
            `TypeNotSupportedError: type '${got}' is not supported for '${actionName}'`
        )
    }
    static createUnknownTokenError(token: string) {
        return new ErrorObj(`UnknownTokenError: unknown token '${token}'`)
    }
    static createOperatorNotSupportedError(
        operator: string,
        left?: string | null,
        right?: string | null
    ) {
        return new ErrorObj(
            `OperatorNotSupportedError: ${left} ${operator} ${right}`
        )
    }
    static createInfixError(data: {
        left?: ErrorObj
        operator?: ErrorObj
        right?: ErrorObj
    }) {
        let error = ''
        if (data.left) {
            error += data.left.message + '\n'
        }
        if (data.operator) {
            error += data.operator.message + '\n'
        }
        if (data.right) {
            error += data.right.message + '\n'
        }

        return new ErrorObj(`InfixError: ${error}`)
    }
}

export class Environment {
    store: Map<string, Obj> = new Map()
    constCheck: Set<string> = new Set()
    outer?: Environment

    constructor(outer?: Environment) {
        this.outer = outer
    }

    get(key: string): Obj | null {
        let obj = this.store.get(key) ?? this.outer?.store.get(key)

        if (obj) {
            return obj
        }
        return null
    }

    reassign(key: string, obj: Obj | null): Obj | null {
        if (obj) {
            if (this.constCheck.has(key)) {
                return ErrorObj.createConstantReassignError(key)
            }
            const varObj = this.get(key)
            if (!varObj) {
                return ErrorObj.createIdentifierNotFoundError(key)
            }
            this.store.set(key, obj)
        }
        return obj
    }

    setMutable(key: string, obj: Obj | null): Obj | null {
        if (obj) {
            if (this.get(key)) {
                return ErrorObj.createAlreadyAssignedError(key)
            }
            this.store.set(key, obj)
        }
        return obj
    }

    setImmutable(key: string, obj: Obj | null): Obj | null {
        if (obj) {
            if (this.constCheck.has(key)) {
                return ErrorObj.createConstantReassignError(key)
            }
            this.constCheck.add(key)
            this.store.set(key, obj)
        }
        return obj
    }
}

export class FunctionObject extends Obj {
    constructor(
        public params: Identifier[],
        public body: BlockStatement,
        public env: Environment
    ) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.FUNCTION
    }

    inspect(): string {
        const paramsString = this.params.map((p) => p.toString()).join(', ')

        return `fn(${paramsString}) {\n ${this.body.toString()}\n}`
    }
}

export class Array extends Obj {
    constructor(public elements: (Obj | null)[]) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.ARRAY
    }

    inspect(): string {
        const elements = this.elements.map((el) => el?.inspect()).join(', ')
        return `[${elements}]`
    }
}

export class For extends Obj {
    constructor(
        public index: Identifier,
        public value: Identifier,
        public target: Identifier,
        public body: BlockStatement,
        public env: Environment
    ) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.FOR
    }

    inspect(): string {
        return `for ${this.index.toString()}, ${this.value.toString()} in ${this.target.toString()} { \n ${this.body.toString()}\n}`
    }
}

export class HashKey {
    static createKey(value: string): string {
        return value
    }
}
export type HashPairs = { [Key in HashLiteralKey]: Obj }
export class Hash extends Obj {
    constructor(public pairs: HashPairs) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.HASH
    }

    inspect(): string {
        const pairs = []

        for (const [key, value] of Object.entries(this.pairs)) {
            pairs.push(`${key}: ${value.inspect()}`)
        }

        if (pairs.length > 0) {
            return `{${pairs.join(', ')}}`
        }

        return '{}'
    }

    static isHashable(obj: Obj | null): boolean {
        if (!obj) return false
        if (obj instanceof String) return true
        if (obj instanceof Integer) return true
        if (obj instanceof Bool) return true
        return false
    }
}

export type BuiltinFunction = (...args: (Obj | null)[]) => Obj
export class Builtin extends Obj {
    constructor(public fn: BuiltinFunction) {
        super()
    }

    get type(): ObjType {
        return OBJ_TYPE.BUILTIN
    }

    inspect(): string {
        return 'builtin function'
    }
}
export const BUILTINS: { [key: string]: Builtin } = {
    len: new Builtin((...args) => {
        if (args.length !== 1) {
            return ErrorObj.createArgsLengthError(1, args.length)
        }

        const arg = args[0]

        if (arg instanceof String) {
            return new Integer(arg.value.length)
        }
        if (arg instanceof Array) {
            return new Integer(arg.elements.length)
        }

        return ErrorObj.createTypeNotSupportedError('len', arg?.type)
    }),
    append: new Builtin((...args) => {
        const target = args[0]
        if (!target) {
            return ErrorObj.createObjectRequiredError('append', 'target')
        }

        if (target instanceof Array) {
            if (args.length !== 2) {
                return ErrorObj.createArgsLengthError(2, args.length)
            }
            const element = args[1]
            if (!element) {
                return ErrorObj.createObjectRequiredError(
                    'array append',
                    'element'
                )
            }
            if (element instanceof Obj) {
                target.elements.push(element)

                return target
            }

            return ErrorObj.createTypeError('any', undefined)
        }

        if (target instanceof Hash) {
            if (args.length !== 3) {
                return ErrorObj.createArgsLengthError(3, args.length)
            }
            const key = args[1]
            if (!key) {
                return ErrorObj.createObjectRequiredError('hash append', 'key')
            }
            if (!key.toHashKey) {
                return ErrorObj.createTypeNotSupportedError(
                    'hash append',
                    key.type
                )
            }
            const value = args[2]
            if (!value) {
                return ErrorObj.createObjectRequiredError(
                    'hash append',
                    'value'
                )
            }
            target.pairs[key.toHashKey()] = value

            return target
        }

        return ErrorObj.createTypeNotSupportedError('append', target.type)
    }),
    remove: new Builtin((...args) => {
        if (args.length !== 2) {
            return ErrorObj.createArgsLengthError(2, args.length)
        }

        const target = args[0]

        if (target instanceof Array) {
            const index = args[1]
            if (!index) {
                return ErrorObj.createObjectRequiredError(
                    'Array Remove',
                    'index'
                )
            }
            if (!(index instanceof Integer)) {
                return ErrorObj.createTypeError(OBJ_TYPE.INTEGER, index?.type)
            }

            const newElements = target.elements.filter(
                (_, i) => i !== index.value
            )

            if (newElements.length === target.elements.length - 1) {
                target.elements = newElements
                return TRUE
            }
            return FALSE
        }

        if (target instanceof Hash) {
            const key = args[1]
            if (!key) {
                return ErrorObj.createObjectRequiredError('Hash Remove', 'key')
            }
            if (!(key instanceof String)) {
                return ErrorObj.createTypeError(OBJ_TYPE.STRING, key.type)
            }
            const value = target.pairs[key.value]

            if (!value) return TRUE
            delete target.pairs[key.value]
            return FALSE
        }

        return ErrorObj.createTypeNotSupportedError('REMOVE', target?.type)
    }),
    typeof: new Builtin((...args) => {
        if (args.length !== 1) {
            return ErrorObj.createArgsLengthError(1, args.length)
        }

        const target = args[0]
        if (!target) {
            return ErrorObj.createObjectRequiredError('typeof', 'target')
        }

        return new String(target.type)
    }),
    print: new Builtin((...args) => {
        args.forEach((arg) => {
            console.log(arg?.inspect())
        })
        return NULL
    }),
    string: new Builtin((...args) => {
        let out = ''
        args.forEach((arg) => {
            out += arg?.inspect()
        })
        return new String(out)
    }),
    int: new Builtin((...args) => {
        if (args.length !== 1) {
            return ErrorObj.createArgsLengthError(1, args.length)
        }
        const arg = args[0]
        if (arg instanceof String) {
            const number = parseInt(arg.value, 10)
            return new Integer(number)
        }
        return NULL
    }),
}
