// This file creates a special client for build time that doesn't actually connect
import { PrismaClient } from '@prisma/client';

// Create a mock client for build time
const prismaClientSingleton = () => {
  if (process.env.VERCEL_ENV === 'production') {
    // During Vercel build, return a mock that doesn't actually connect
    return new Proxy({}, {
      get: (target, prop) => {
        if (prop === '$disconnect') {
          return () => Promise.resolve();
        }
        return () => Promise.resolve([]);
      }
    });
  }
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 