const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Update Ortencias description
  const leonDeJudah = await prisma.room.findUnique({ where: { contentName: 'Habitación León de Judah' } });
  
  if (leonDeJudah) {
    await prisma.room.update({
      where: { contentName: 'Habitación Ortencias' },
      data: { description: leonDeJudah.description }
    });
    console.log('Updated Habitación Ortencias description.');
  }

  // 2. Add translations (desc_es and desc_en) for all rooms
  const rooms = await prisma.room.findMany();
  
  const translations = {
    'Master Suite Casa Judah': {
      es: 'Suite con cama King + sofá cama doble. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata, Fogata privada.',
      en: 'Suite with King bed + double sofa bed. Includes: Breakfast for four people, Access to the pool, Bicycle ride, Interaction with our animals, Access to the campfire area, Private campfire.'
    },
    'Habitación Familiar Doble': {
      es: 'Habitación con 2 camas Queen. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      en: 'Room with 2 Queen beds. Includes: Breakfast for four people, Access to the pool, Bicycle ride, Interaction with our animals, Access to the campfire area.'
    },
    'Habitación León de Judah': {
      es: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      en: 'Room with King bed. Includes: Breakfast for two people, Access to the pool, Bicycle ride, Interaction with our animals, Access to the campfire area.'
    },
    'Habitación Ortencias': {
      es: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      en: 'Room with King bed. Includes: Breakfast for two people, Access to the pool, Bicycle ride, Interaction with our animals, Access to the campfire area.'
    }
  };

  for (const room of rooms) {
    const t = translations[room.contentName];
    if (t) {
      await prisma.room.update({
        where: { id: room.id },
        data: {
          desc_es: t.es,
          desc_en: t.en
        }
      });
      console.log(`Updated translations for ${room.contentName}`);
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
