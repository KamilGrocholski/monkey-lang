import { Expression } from '..'
import { Token } from '../../lexer'

export type HashLiteralKey = string
export type HashLiteralPairs = Map<Expression, Expression>

export class HashLiteral extends Expression {
    constructor(public token: Token, public pairs: HashLiteralPairs) {
        super()
    }

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        const pairs = []

        for (const [key, value] of this.pairs.entries()) {
            pairs.push(`${key}: ${value}`)
        }

        if (pairs.length > 0) {
            return `{${pairs.join(', ')}}`
        }

        return '{}'
    }
}
