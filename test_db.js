const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.reservation.count();
  const res = await prisma.reservation.findMany({ include: { room: true } });
  console.log(`Reservations count: ${count}`);
  console.log(res);
}

main().catch(console.error).finally(() => prisma.$disconnect());
