import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}

const getPrisma = (): PrismaClient => {
    if (!globalThis.prisma) {
        const url = process.env.DATABASE_URL || 'file:./dev.db';

        // If SQLite, use native Prisma initialization
        if (url.startsWith('file:')) {
            globalThis.prisma = new PrismaClient();
        } else {
            const pool = new Pool({ connectionString: url });
            const adapter = new PrismaPg(pool);
            globalThis.prisma = new PrismaClient({ adapter });
        }
    }
    return globalThis.prisma;
};

const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        const instance = getPrisma();
        const value = (instance as any)[prop];
        if (typeof value === 'function') {
            return value.bind(instance);
        }
        return value;
    }
});

export default prisma;
