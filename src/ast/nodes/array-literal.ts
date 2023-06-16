import { Expression } from '..'
import { Token } from '../../lexer'

export class ArrayLiteral extends Expression {
    constructor(public token: Token, public elements: Expression[]) {
        super()
    }

    expressionNode(): void {}

    tokenLiteral(): string {
        return this.token.literal
    }

    toString(): string {
        const elements = this.elements?.map((el) => el.toString()).join(', ')
        return `[${elements}]`
    }
}
