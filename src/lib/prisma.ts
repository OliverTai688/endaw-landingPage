import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const prismaClientSingleton = () => {
    console.log('Initializing PrismaClient singleton V2...');
    const connectionString = process.env.DATABASE_URL;
    console.log('DATABASE_URL present:', !!connectionString);
    const pool = new pg.Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

declare global {
    var prismaGlobalV2: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobalV2 ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobalV2 = prisma
