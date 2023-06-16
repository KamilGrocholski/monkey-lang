<h1 align='center'>Writing an interpreter in Typescript for the Monkey programming language</h1>

<p align='center'>
Based on "Writing an interpreter in Go" -> (https://interpreterbook.com)
</p>

## Testing

```bash
npm run test
```

## REPL

```bash
npm run repl
```

### REPL example

```bash
 npm run repl

> monkey-lang@1.0.0 repl
> ts-node src/repl/index.ts

>>let users = [{"name": "Alice", "age": 20}, {"name": "Anna", "age": 28}]
[{STRING_417: Alice, STRING_301: 20}, {STRING_417: Anna, STRING_301: 28}]
>>users[1]
{STRING_417: Anna, STRING_301: 28}
>>users[100]
null
>>users[0]["name"]
Alice
>>
```
