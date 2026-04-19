const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany();
  rooms.forEach(room => {
    console.log(`--- Room: ${room.contentName} ---`);
    console.log(`ID: ${room.id}`);
    console.log(`Base Price: ${room.basePrice}`);
    console.log(`Capacity: ${room.capacity}`);
    console.log(`Description (ES): ${room.desc_es}`);
    console.log(`Description (EN): ${room.desc_en}`);
    console.log('---------------------------');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
