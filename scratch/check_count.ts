import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.post.count();
  console.log("Total posts in DB:", count);
}
main();
