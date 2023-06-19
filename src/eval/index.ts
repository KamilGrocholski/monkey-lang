import { AstNode, Expression, Statement } from '../ast'
import { BooleanLiteral } from '../ast/nodes/boolean-literal'
import { IntegerLiteral } from '../ast/nodes/integer-literal'
import { Program } from '../ast/nodes/program'
import {
    Bool,
    FALSE,
    Integer,
    NULL,
    OBJ_TYPE,
    Obj,
    TRUE,
    String,
    ReturnValue,
    ErrorObj,
    Environment,
    FunctionObject,
    BUILTINS,
    Array,
    Builtin,
    Hash,
    HashPairs,
    For,
    Null,
} from '../objects'
import { ExpressionStatement } from '../ast/nodes/expression-statement'
import { PrefixExpression } from '../ast/nodes/prefix-expression'
import { TOKEN_KIND } from '../lexer'
import { InfixExpression } from '../ast/nodes/infix-expression'
import { IfExpression } from '../ast/nodes/if-expression'
import { ReturnStatement } from '../ast/nodes/return-statement'
import { BlockStatement } from '../ast/nodes/block-statement'
import { LetStatement } from '../ast/nodes/let-statement'
import { Identifier } from '../ast/nodes/identifier'
import { FunctionLiteral } from '../ast/nodes/function-literal'
import { CallExpression } from '../ast/nodes/call-expression'
import { StringLiteral } from '../ast/nodes/string-literal'
import { ArrayLiteral } from '../ast/nodes/array-literal'
import { IndexExpression } from '../ast/nodes/index-expression'
import { HashLiteral } from '../ast/nodes/hash-literal'
import { ForExpression } from '../ast/nodes/for-expression'

function boolLookup(bool: boolean): Bool {
    return bool ? TRUE : FALSE
}

export function evaluate(node: AstNode | null, env: Environment): Obj | null {
    if (node instanceof IntegerLiteral) {
        return new Integer(node.value)
    }
    if (node instanceof StringLiteral) {
        return new String(node.value)
    }
    if (node instanceof ForExpression) {
        const forObj = new For(
            node.index,
            node.value,
            node.target,
            node.body,
            env
        )
        return applyFor(forObj)
    }
    if (node instanceof HashLiteral) {
        return evalHashLiteral(node, env)
    }
    if (node instanceof ArrayLiteral) {
        const elements = evalExpressions(node.elements, env)
        if (elements.length === 1 && isError(elements[0])) {
            return elements[0]
        }
        return new Array(elements)
    }
    if (node instanceof IndexExpression) {
        const left = evaluate(node.left, env)
        if (isError(left)) {
            return left
        }
        const index = evaluate(node.index, env)
        if (isError(index)) {
            return index
        }
        return evalIndexExpression(left, index)
    }
    if (node instanceof BooleanLiteral) {
        return boolLookup(node.value)
    }
    if (node instanceof Program) {
        return evalStatements(node.statements, env)
    }
    if (node instanceof ExpressionStatement) {
        return evaluate(node.exp, env)
    }
    if (node instanceof PrefixExpression) {
        const right = evaluate(node.right, env)
        if (isError(right)) {
            return right
        }
        return evalPrefixExpression(node.operator, right)
    }
    if (node instanceof InfixExpression) {
        const left = evaluate(node.left, env)
        const right = evaluate(node.right, env)
        if (isError(left)) {
            return left
        }
        if (isError(right)) {
            return right
        }
        return evalInfixExpression(node.operator, left, right, env)
    }
    if (node instanceof IfExpression) {
        return evalIfExpression(node, env)
    }
    if (node instanceof ReturnStatement) {
        const value = evaluate(node.returnValue, env)
        if (isError(value)) {
            return value
        }
        if (value) {
            return new ReturnValue(value)
        }
    }
    if (node instanceof BlockStatement) {
        return evalStatements(node.statements, env)
    }
    if (node instanceof LetStatement) {
        const value = evaluate(node.value, env)
        if (isError(value)) {
            return value
        }
        if (node.name?.value) {
            env.set(node.name.value, value)
        }
        return value
    }
    if (node instanceof Identifier) {
        return evalIdentifier(node, env)
    }
    if (node instanceof FunctionLiteral) {
        const params = node.parameters
        const body = node.body
        if (params && body) {
            return new FunctionObject(params, body, env)
        }
        return newError(`some error...`) // TODO
    }
    if (node instanceof CallExpression) {
        const fn = evaluate(node.fn, env)
        if (isError(fn)) {
            return fn
        }
        if (node.args) {
            const args = evalExpressions(node.args, env)
            if (args.length === 1 && isError(args[0])) {
                return args[0]
            }

            return applyFunction(fn, args)
        }
    }

    return null
}

function evalPrefixExpression(operator: string, right: Obj | null): Obj | null {
    switch (operator) {
        case '!':
            return evalBangOperatorExpression(right)
        case '-':
            return evalMinusPrefixOperatorExpression(right)
        default:
            return newError(`unknown operator: ${operator}${right?.type}`)
    }
}

function evalStatements(statements: Statement[], env: Environment): Obj | null {
    let result: Obj | null = null

    for (const s of statements) {
        result = evaluate(s, env)

        if (result !== null) {
            if (result instanceof ReturnValue) {
                return result.value
            }
            if (result instanceof ErrorObj) {
                return result
            }
        }
    }

    return result
}

function evalBangOperatorExpression(right: Obj | null): Obj {
    switch (right) {
        case FALSE:
        case NULL:
            return TRUE
        case TRUE:
        default:
            return FALSE
    }
}

function evalMinusPrefixOperatorExpression(right: Obj | null): Obj {
    if (right?.type !== OBJ_TYPE.INTEGER) {
        return newError(`unknown operator: -${right?.type}`)
    }

    const value = (right as unknown as IntegerLiteral).value
    return new Integer(-value) // adding '-' before the value to convert to a negative number
}

function evalInfixExpression(
    operator: string,
    left: Obj | null,
    right: Obj | null,
    env: Environment
): Obj {
    if (left instanceof Null) {
        return evalNullInfixExpression(operator, right)
    }
    if (right instanceof Null) {
        return evalNullInfixExpression(operator, left)
    }
    if (left instanceof Integer && right instanceof Integer) {
        return evalIntegerInfixExpression(operator, left, right)
    }
    if (left instanceof String && right instanceof String) {
        return evalStringInfixExpression(operator, left, right)
    }
    if (left instanceof Bool && right instanceof Bool) {
        return evalBoolInfixExpression(operator, left, right)
    }
    if (left instanceof Hash && right instanceof Hash) {
        return evalHashInfixExpression(operator, left, right)
    }
    if (left instanceof Array && right instanceof Array) {
        return evalArrayInfixExpression(operator, left, right)
    }
    return newError(`type mismatch: ${left?.type} ${operator} ${right?.type}`)
}

function evalNullInfixExpression(operator: string, right: Obj | null): Obj {
    switch (operator) {
        case TOKEN_KIND.Equal:
            return boolLookup(right?.type === OBJ_TYPE.NULL)
        case TOKEN_KIND.NotEqual:
            return boolLookup(right?.type !== OBJ_TYPE.NULL)
        default:
            return newError(`operator not supported: ${operator}`)
    }
}

function evalHashInfixExpression(
    operator: string,
    left: Hash,
    right: Hash
): Obj {
    switch (operator) {
        case TOKEN_KIND.Equal:
            return boolLookup(left.pairs === right.pairs)
        case TOKEN_KIND.NotEqual:
            return boolLookup(left.pairs !== right.pairs)
        default:
            return newError(`operator not supported: ${operator}`)
    }
}

function evalArrayInfixExpression(
    operator: string,
    left: Array,
    right: Array
): Obj {
    switch (operator) {
        case TOKEN_KIND.Equal:
            return boolLookup(left.elements === right.elements)
        case TOKEN_KIND.NotEqual:
            return boolLookup(left.elements !== right.elements)
        default:
            return newError(`operator not supported: ${operator}`)
    }
}

function evalIntegerInfixExpression(
    operator: string,
    left: Integer | null,
    right: Integer | null
): Obj {
    if (!left || !right) {
        return newError(`lack of arguments: ${left?.type} ${right?.type}`)
    }

    const leftValue = left.value
    const rightValue = right.value

    switch (operator) {
        case TOKEN_KIND.Plus:
            return new Integer(leftValue + rightValue)
        case TOKEN_KIND.Minus:
            return new Integer(leftValue - rightValue)
        case TOKEN_KIND.Asterisk:
            return new Integer(leftValue * rightValue)
        case TOKEN_KIND.Slash:
            return new Integer(leftValue / rightValue)
        case TOKEN_KIND.LessThan:
            return boolLookup(leftValue < rightValue)
        case TOKEN_KIND.GreaterThan:
            return boolLookup(leftValue > rightValue)
        case TOKEN_KIND.Equal:
            return boolLookup(leftValue === rightValue)
        case TOKEN_KIND.NotEqual:
            return boolLookup(leftValue !== rightValue)
        default:
            return newError(
                `unknown operator: ${left.type} ${operator} ${right.type}`
            )
    }
}

function evalStringInfixExpression(
    operator: string,
    left: String | null,
    right: String | null
): Obj {
    if (!left || !right) {
        return newError(
            `lack of arguments: ${left?.type} ${operator} ${right?.type}`
        )
    }
    switch (operator) {
        case TOKEN_KIND.Plus:
            return new String(left.value + right.value)
        case TOKEN_KIND.Equal:
            return boolLookup(left.value === right.value)
        case TOKEN_KIND.NotEqual:
            return boolLookup(left.value !== right.value)
        default:
            return newError(
                `unknown operator: ${left.type} ${operator} ${right.type}`
            )
    }
}

function evalBoolInfixExpression(
    operator: string,
    left: Bool | null,
    right: Bool | null
): Obj {
    if (!left || !right) {
        return newError(
            `lack of arguments: ${left?.type} ${operator} ${right?.type}`
        )
    }
    if (operator === TOKEN_KIND.Equal) {
        return boolLookup(left.value === right.value)
    }

    return newError(`unknown operator: ${left.type} ${operator} ${right.type}`)
}

function isTruthy(obj: Obj | null): boolean {
    switch (obj) {
        case NULL:
        case FALSE:
            return false
        case TRUE:
        default:
            return true
    }
}

function evalIfExpression(exp: IfExpression, env: Environment): Obj | null {
    const condition = evaluate(exp.condition, env)
    if (isError(condition)) {
        return condition
    }

    if (isTruthy(condition)) {
        return evaluate(exp.consequence, env)
    } else if (exp.alternative !== null) {
        return evaluate(exp.alternative, env)
    } else {
        return NULL
    }
}

function evalIndexExpression(left: Obj | null, index: Obj | null): Obj | null {
    if (left instanceof Array) {
        if (!(index instanceof Integer)) {
            return ErrorObj.createTypeError(OBJ_TYPE.INTEGER, index?.type)
        }
        return evalArrayIndexExpression(left, index)
    }
    if (left instanceof Hash) {
        if (!index?.toHashKey) {
            return ErrorObj.createTypeNotSupportedError(
                'Hash Index',
                index?.type
            )
        }
        return evalHashIndexExpression(left, index)
    }
    return ErrorObj.createTypeNotSupportedError(
        'evalIndexExpression',
        left?.type
    )
}

function evalHashIndexExpression(left: Hash, index: Obj): Obj | null {
    if (!index.toHashKey) {
        return ErrorObj.createTypeNotSupportedError('Hash Index', index.type)
    }
    const key = index.toHashKey()
    const pair = left.pairs[key]
    if (pair) {
        return pair
    }
    return null
}

function evalArrayIndexExpression(left: Array, index: Integer): Obj | null {
    const maxIndex = left.elements.length - 1
    if (index.value < 0 || index.value > maxIndex) {
        return NULL
    }
    return left.elements[index.value]
}

function evalHashLiteral(node: HashLiteral, env: Environment): Obj | null {
    const pairs: HashPairs = {}
    for (const [keyExp, valueExp] of node.pairs.entries()) {
        const key = evaluate(keyExp, env)
        if (isError(key)) {
            return key
        }
        if (!key?.toHashKey) {
            return ErrorObj.createTypeNotSupportedError(
                'Hash Literal',
                key?.type
            )
        }
        const value = evaluate(valueExp, env)
        if (isError(value)) {
            return value
        }
        pairs[key.toHashKey()] = value as Obj
    }

    return new Hash(pairs)
}

function evalIdentifier(node: Identifier, env: Environment): Obj | null {
    const value = env.get(node.value)
    if (value) {
        return value
    }
    const builtin = BUILTINS[node.value]
    if (builtin) {
        return builtin
    }
    return ErrorObj.createIdentifierNotFoundError(node.value)
}

function evalExpressions(exps: Expression[], env: Environment): (Obj | null)[] {
    const result: (Obj | null)[] = []
    for (const exp of exps) {
        const evaluated = evaluate(exp, env)
        if (isError(evaluated)) {
            return [evaluated]
        }
        result.push(evaluated)
    }

    return result
}

function applyFunction(fn: Obj | null, args: (Obj | null)[]): Obj | null {
    if (fn instanceof FunctionObject && fn.type === OBJ_TYPE.FUNCTION) {
        const extendedEnv = extendedFunctionEnv(fn, args)
        const evaluated = evaluate(fn.body, extendedEnv)

        return unwrapReturnValue(evaluated)
    }
    if (fn instanceof Builtin && fn.type === OBJ_TYPE.BUILTIN) {
        return fn.fn(...args)
    }

    return ErrorObj.createTypeError(OBJ_TYPE.FUNCTION, fn?.type)
}

function applyFor(forObj: Obj | null): Obj | null {
    if (forObj instanceof For && forObj.type === OBJ_TYPE.FOR) {
        const targetName = forObj.target
        const target = forObj.env.get(targetName.value)

        if (target instanceof Array) {
            const closureEnv = new Environment(forObj.env)
            target.elements.forEach((e, i) => {
                closureEnv.set(forObj.index.value, new Integer(i))
                closureEnv.set(forObj.value.value, e)
                evaluate(forObj.body, closureEnv)
            })
            return forObj
        }
        if (target instanceof Hash) {
            const closureEnv = new Environment(forObj.env)
            const pairsArr = Object.entries(target.pairs)
            pairsArr.forEach(([key, val]) => {
                closureEnv.set(forObj.index.value, new String(key))
                closureEnv.set(forObj.value.value, val)
                evaluate(forObj.body, closureEnv)
            })
            return forObj
        }

        return ErrorObj.createTypeNotSupportedError('for loop', target?.type)
    }

    return newError(`not a for: ${forObj?.type}`)
}

/**
    closure env + main env : fn
*/
function extendedFunctionEnv(
    fn: FunctionObject,
    args: (Obj | null)[]
): Environment {
    const closureEnv = new Environment(fn.env)

    fn.params.forEach((param, paramIndex) => {
        closureEnv.set(param.value, args[paramIndex])
    })

    return closureEnv
}

function unwrapReturnValue(obj: Obj | null): Obj | null {
    if (obj instanceof ReturnValue && obj.type === OBJ_TYPE.RETURN_VALUE) {
        return obj.value
    }

    return obj
}

export function newError(format: string): ErrorObj {
    return new ErrorObj(format)
}

function isError(obj: Obj | null): boolean {
    return obj !== null
        ? obj?.type === OBJ_TYPE.ERROR && obj instanceof ErrorObj
        : false
}
