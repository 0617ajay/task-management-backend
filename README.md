## We will use Neon (Free PostgreSQL)
[text](https://neon.tech/)


```
npx prisma generate
npx prisma migrate dev --name init
npx prisma migrate dev --name add-user-table
npx prisma migrate reset
```


