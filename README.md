<h1 align='center'>Writing an interpreter in Typescript for the Monkey programming language</h1>

<p align='center'>
Based on "Writing an interpreter in Go" -> (https://interpreterbook.com)
</p>
<p align='center'>
<img src="https://interpreterbook.com/img/cover-cb2da3d1.png"/>
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

>>let ROLES = {"ADMIN": 0, "BASIC": 1}
>>let users = []
>>append(users, {"name": "Annie", "role": ROLES["ADMIN"]})
>>append(users, {"name": "Erwin", "role": ROLES["ADMIN"]})
>>append(users, {"name": "John", "role": ROLES["BASIC"]})
>>print(users)
[{name: Annie, role: 0}, {name: Erwin, role: 0}, {name: John, role: 1}]
>>let isAdmin = fn(user) {user["role"] == ROLES["ADMIN"];}
>>let firstUser = users[0]
>>print(firstUser)
{name: Annie, role: 0}
>>
>>print(isAdmin(firstUser))
true
>>for _, user in users {print(isAdmin(user))}
true
true
false
>>
```
