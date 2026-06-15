import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    },
  },
}).$extends({
  query: {
    $allOperations({ query, args }) {
      return query(args)
    },
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma 