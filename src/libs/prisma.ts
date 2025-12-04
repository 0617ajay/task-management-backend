// // src/prisma.ts (or wherever you initialize)
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient({
//   // Optional: Log all database queries for debugging
//   // log: ['query', 'info', 'warn', 'error'],
// });

// export default prisma;

import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import {PrismaClient} from "../../generated/prisma/client.ts"
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }