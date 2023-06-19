import readline from 'readline'

import { Lexer } from '../lexer'
import Parser from '../parser'
import { evaluate } from '../eval'
import { Environment, ErrorObj } from '../objects'

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '>>',
})

rl.prompt()

const env = new Environment()

rl.on('line', (input) => {
    const lexer = new Lexer(input)
    const parser = new Parser(lexer)
    const program = parser.parseProgram()

    if (parser.errors.length !== 0) {
        printParserErrors(parser.errors)
        return
    }

    const evaluated = evaluate(program, env)
    if (evaluated instanceof ErrorObj) {
        console.error(evaluated.message)
    }
    // console.log(evaluated?.inspect())

    rl.prompt()
})

rl.on('close', () => {
    console.log('Exit')
    process.exit(0)
})

function printParserErrors(errors: string[]) {
    console.error('PARSER ERRORS -- ')
    errors.forEach((err) => {
        console.error(`\t ${err} \n`)
    })
}
