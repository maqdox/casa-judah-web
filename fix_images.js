const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  
  for (const r of rooms) {
    // If the image is a placeholder from our original dev seed, swap it for something real
    if (r.imageUrls.includes('2026-04')) {
      const freshImage = r.contentName.includes('Olive') ? '/exterior.jpg' : '/piscina.jpg';
      await prisma.room.update({
        where: { id: r.id },
        data: { imageUrls: freshImage }
      });
      console.log(`Updated ${r.contentName} -> ${freshImage}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
