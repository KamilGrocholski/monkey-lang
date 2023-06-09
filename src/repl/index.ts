import readline from 'readline'

import { Lexer } from '../lexer'

const rl = readline.createInterface({
    input: process.stdin,
})

rl.on('line', (input) => {
    const lexer = new Lexer(input)

    while (true) {
        const token = lexer.getNextToken()
        console.log(token)
        if (token.kind === 'EOF') {
            break
        }
    }
})

rl.on('close', () => {
    console.log('Exit')
})
