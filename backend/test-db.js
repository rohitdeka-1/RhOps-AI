const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    const clusters = await prisma.cluster.findMany();
    console.log(clusters);
}
main().catch(console.error).finally(() => prisma.$disconnect());
