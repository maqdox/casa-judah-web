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
        imageUrls: '/rooms/familiar_doble/fd_camas.jpeg|/rooms/familiar_doble/fd_cama.jpeg|/rooms/familiar_doble/fd_patio.jpeg|/rooms/familiar_doble/fd_bano.jpeg'
      }
    });
    console.log('Successfully updated images for:', updated.contentName);
  } else {
    console.log('Room not found');
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
