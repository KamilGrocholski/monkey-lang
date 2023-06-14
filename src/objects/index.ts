export type ObjType = (typeof OBJ_TYPE)[keyof typeof OBJ_TYPE]
export const OBJ_TYPE = {
    INTEGER: 'INTEGER',
    BOOL: 'BOOL',
    NULL: 'NULL',
    STRING: 'STRING',
    RETURN_VALUE: 'RETURN_VALUE',
    ERROR: 'ERROR',
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
