import { BlockStatement } from '../ast/nodes/block-statement'
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
} as const

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
        return newError(`argument to 'len' not supported, got ${arg?.type}`)
    }),
}
