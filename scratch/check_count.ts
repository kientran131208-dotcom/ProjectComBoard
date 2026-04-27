import { PrismaClient } from "./generated/client_v4";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.post.count();
  console.log("Total posts in DB:", count);
}
main();
