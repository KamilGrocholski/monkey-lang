import { AstNode, Statement } from '../ast'
import { BooleanLiteral } from '../ast/nodes/boolean-literal'
import { IntegerLiteral } from '../ast/nodes/integer-literal'
import { Program } from '../ast/nodes/program'
import { FALSE, Integer, NULL, OBJ_TYPE, Obj, TRUE } from '../objects'
import { ExpressionStatement } from '../ast/nodes/expression-statement'
import { PrefixExpression } from '../ast/nodes/prefix-expression'

export function evaluate(node: AstNode | null): Obj | null {
    if (node instanceof IntegerLiteral) {
        return new Integer(node.value)
    }
    if (node instanceof BooleanLiteral) {
        return node.value ? TRUE : FALSE
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
    return new Integer(value)
}
