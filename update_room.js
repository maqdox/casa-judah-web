const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const room = await prisma.room.findFirst({
    where: { contentName: 'Habitación Familiar Doble' }
  });
  if (room) {
    const updated = await prisma.room.update({
      where: { id: room.id },
      data: { 
        imageUrls: '/room3.jpg|/room2.jpg|/room1.jpg',
        sortOrder: 0
      }
    });
    console.log('Successfully updated Habitación Familiar Doble');
  } else {
    console.log('Room not found');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
