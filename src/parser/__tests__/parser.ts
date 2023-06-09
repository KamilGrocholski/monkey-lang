import { Parser } from '..'
import { Lexer, TOKEN_KIND } from '../../lexer'

test('test let statement', () => {
    const input = `let x = 5;
let y = 10;
let foobar = 838383;`

    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    console.log(program.toString())
})
