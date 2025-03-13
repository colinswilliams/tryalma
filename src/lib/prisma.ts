import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Function to get Prisma client that won't connect during build time
export function getPrismaClient() {
  return new PrismaClient();
}

// Export a prisma instance that's created lazily when needed
export const prisma = globalForPrisma.prisma || new PrismaClient();

// Only assign to the global object in development to prevent memory leaks
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma; 