const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Room 1: King
  await prisma.room.update({
    where: { id: '78bcac20-3c50-4b75-9003-80697f4a0b0f' },
    data: {
      contentName: 'Habitación King',
      description: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_es: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_en: 'Room with King bed. Includes: Breakfast for two, pool access, bicycle ride, interaction with animals, fire pit access.',
      basePrice: 2980,
      capacity: 2,
      status: 'AVAILABLE',
      sortOrder: 1
    }
  });

  // Room 2: Double Family
  await prisma.room.update({
    where: { id: 'e938132f-0bed-40bb-911c-7d42ade59315' },
    data: {
      contentName: 'Habitación Doble Familiar la concepción',
      description: 'Habitación con 2 camas Queen. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_es: 'Habitación con 2 camas Queen. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_en: 'Room with 2 Queen beds. Includes: Breakfast for four, pool access, bicycle ride, interaction with animals, fire pit access.',
      basePrice: 3700,
      capacity: 4,
      status: 'AVAILABLE',
      sortOrder: 2
    }
  });

  // Room 3: Master Suite
  await prisma.room.update({
    where: { id: 'ad5de85a-4789-4092-b6e6-ab6ba0324cf1' },
    data: {
      contentName: 'Master Suite Judah',
      description: 'Suite con cama King + sofá cama doble. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata, Fogata privada.',
      desc_es: 'Suite con cama King + sofá cama doble. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata, Fogata privada.',
      desc_en: 'Suite with King bed + double sofa bed. Includes: Breakfast for four, pool access, bicycle ride, interaction with animals, fire pit access, private fire pit.',
      basePrice: 4190,
      capacity: 4,
      status: 'AVAILABLE',
      sortOrder: 3
    }
  });

  // Room 4: Inactivate
  await prisma.room.update({
    where: { id: '0d52e166-f2b0-4e7f-ae56-68c1a25e6e91' },
    data: { status: 'UNAVAILABLE' }
  });

  console.log('Rooms updated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
