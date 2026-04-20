const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  
  for (const room of rooms) {
    if (room.imageUrls && room.imageUrls.includes(',') && !room.imageUrls.includes('|')) {
      // It has commas but no pipes, likely old data. 
      // But wait, data:image/jpeg;base64, has a comma.
      // So I need a smarter replace.
      
      // If we have "data:image/jpeg;base64,AAAA,data:image/jpeg;base64,BBBB"
      // We want to replace the commas that separate the base64 strings, NOT the internal ones.
      
      const fixed = room.imageUrls.replace(/,data:image/g, '|data:image');
      
      if (fixed !== room.imageUrls) {
        await prisma.room.update({
          where: { id: room.id },
          data: { imageUrls: fixed }
        });
        console.log(`Fixed images for room: ${room.contentName}`);
      }
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
