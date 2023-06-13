import { AstNode, Statement } from '../ast'
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
} from '../objects'
import { ExpressionStatement } from '../ast/nodes/expression-statement'
import { PrefixExpression } from '../ast/nodes/prefix-expression'
import { TOKEN_KIND } from '../lexer'
import { InfixExpression } from '../ast/nodes/infix-expression'

function boolLookup(bool: boolean): Bool {
    return bool ? TRUE : FALSE
}

export function evaluate(node: AstNode | null): Obj | null {
    if (node instanceof IntegerLiteral) {
        return new Integer(node.value)
    }
    if (node instanceof BooleanLiteral) {
        return boolLookup(node.value)
    }
    if (node instanceof Program) {
        return evalStatements(node.statements)
    }
    if (node instanceof ExpressionStatement) {
        return evaluate(node.exp)
    }
    if (node instanceof PrefixExpression) {
        const right = evaluate(node.right)
        return evalPrefixExpression(node.operator, right)
    }
    if (node instanceof InfixExpression) {
        const left = evaluate(node.left)
        const right = evaluate(node.right)
        return evalInfixExpression(node.operator, left, right)
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
            return NULL
    }
}

function evalStatements(statements: Statement[]): Obj | null {
    let result: Obj | null = null

    statements.forEach((s) => {
        result = evaluate(s)
    })

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
        return NULL
    }

    const value = (right as unknown as IntegerLiteral).value
    return new Integer(-value) // adding '-' before the value to convert to a negative number
}

function evalInfixExpression(
    operator: string,
    left: Obj | null,
    right: Obj | null
): Obj {
    if (left instanceof Integer && right instanceof Integer) {
        return evalIntegerInfixExpression(operator, left, right)
    }
    if (left instanceof String && right instanceof String) {
        return evalStringInfixExpression(operator, left, right)
    }

    throw new Error(`no match for pair: ${left?.type} and ${right?.type}`)
}

function evalIntegerInfixExpression(
    operator: string,
    left: Integer | null,
    right: Integer | null
): Obj {
    if (!left || !right) return NULL

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
            throw new Error(`unknown operator: ${operator}`)
    }
}

function evalStringInfixExpression(
    operator: string,
    left: String | null,
    right: String | null
): Obj {
    if (!left || !right) {
        throw new Error('required left and right')
    }
    if (operator === TOKEN_KIND.Plus) {
        return new String(left.value + right.value)
    }

    throw new Error('operator does not match')
}
