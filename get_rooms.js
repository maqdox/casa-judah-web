const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  rooms.forEach(room => {
    console.log(`Room: ${room.contentName}`);
    console.log(`Images: ${room.imageUrls}`);
    console.log('---');
  });
}
main().catch(console.error).finally(() => prisma.$disconnect());
