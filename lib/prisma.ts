import { PrismaClient } from "../generated/client_v4";

const prismaClientSingleton = () => {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prismaV4: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prismaV4 ?? prismaClientSingleton();

export { prisma };

if (process.env.NODE_ENV !== "production") globalForPrisma.prismaV4 = prisma;
