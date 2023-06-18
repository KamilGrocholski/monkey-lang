import { BlockStatement } from '../ast/nodes/block-statement'
import { HashLiteralKey } from '../ast/nodes/hash-literal'
import { Identifier } from '../ast/nodes/identifier'
import { newError } from '../eval'

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
}

export class Environment {
    store: Map<string, Obj> = new Map()
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

    set(key: string, obj: Obj | null): Obj | null {
        if (obj) {
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
            return newError(
                `wrong number of arguments: got=${args.length}, expected=1`
            )
        }

        const arg = args[0]

        if (arg instanceof String) {
            return new Integer(arg.value.length)
        }
        if (arg instanceof Array) {
            return new Integer(arg.elements.length)
        }

        return newError(`argument to 'len' not supported, got ${arg?.type}`)
    }),
    append: new Builtin((...args) => {
        if (args.length !== 2) {
            return newError(
                `wrong number of arguments: got=${args.length}, expected=2`
            )
        }
        const array = args[0]
        const element = args[1]
        if (!array) {
            return newError(`array is null`)
        }
        if (!(array instanceof Array)) {
            return newError(
                `first arguments is not type of Array, got ${array?.type}`
            )
        }
        if (!(element instanceof Obj)) {
            return newError(`elements is not Obj`)
        }

        array.elements.push(element)

        return array
    }),
    remove: new Builtin((...args) => {
        if (args.length !== 2) {
            return newError(
                `wrong number of arguments: got=${args.length}, expected=2`
            )
        }
        const array = args[0]
        const index = args[1]
        if (!array) {
            return newError(`array is null`)
        }
        if (!(array instanceof Array)) {
            return newError(
                `first arguments is not type of Array, got ${array?.type}`
            )
        }
        if (!(index instanceof Integer)) {
            return newError(`index is not Integer`)
        }

        const newElements = array.elements.filter((_, i) => i !== index.value)

        if (newElements.length === array.elements.length - 1) {
            array.elements = newElements
            return TRUE
        }

        return FALSE
    }),
    typeof: new Builtin((...args) => {
        if (args.length !== 1) {
            return newError(
                `wrong number of arguments: got=${args.length}, expected=1`
            )
        }

        const target = args[0]
        if (!target) return newError('')

        return new String(target.type)
    }),
    print: new Builtin((...args) => {
        args.forEach((arg) => {
            console.log(arg?.inspect())
        })
        return NULL
    }),
}
