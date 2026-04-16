import pkg from '@prisma/client';
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  const room1 = await prisma.room.upsert({
    where: { contentName: 'The Olive Retreat' },
    update: {},
    create: {
      contentName: 'The Olive Retreat',
      description: 'An elegant suite surrounded by olive groves. Experience luxury living with premium natural textures and warm lighting.',
      basePrice: 150.00,
      capacity: 2,
      imageUrls: '/2026-04-08 (2).webp,/2026-04-08.webp'
    },
  })

  const room2 = await prisma.room.upsert({
    where: { contentName: 'The Vineyard Cabin' },
    update: {},
    create: {
      contentName: 'The Vineyard Cabin',
      description: 'A cozy, premium cabin with sunset views over the hills. Enjoy the ultimate farm experience and modern aesthetics.',
      basePrice: 200.00,
      capacity: 4,
      imageUrls: '/2026-04-08 (3).webp,/2026-04-08 (1).webp'
    },
  })

  // Upsert the default Admin User
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin' },
    update: {},
    create: {
      email: 'admin',
      password: 'admin'
    }
  })

  console.log('Seed completed!', { room1: room1.contentName, room2: room2.contentName, admin: admin.email });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
