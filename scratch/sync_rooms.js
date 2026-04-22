const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const leon = await prisma.room.findFirst({
    where: { contentName: { contains: 'León de Judah' } }
  });

  if (!leon) {
    console.error('Room León de Judah not found');
    return;
  }

  const ortencias = await prisma.room.findFirst({
    where: { contentName: { contains: 'Ortencias' } }
  });

  if (!ortencias) {
    console.error('Room Ortencias not found');
    return;
  }

  console.log('Updating Ortencias with Leon de Judah description...');
  await prisma.room.update({
    where: { id: ortencias.id },
    data: {
      desc_es: leon.desc_es,
      desc_en: leon.desc_en,
      description: leon.description
    }
  });

  console.log('Done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
