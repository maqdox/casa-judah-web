const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Clear existing rooms to start fresh with client categories
  await prisma.room.deleteMany();

  const rooms = [
    {
      contentName: 'Habitación King',
      description: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_es: 'Habitación con cama King. Incluye: Desayuno para dos personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_en: 'Room with King bed. Includes: Breakfast for two, pool access, bicycle ride, interaction with animals, fire pit access.',
      basePrice: 2980,
      capacity: 2,
      imageUrls: '/exterior.jpg', // Placeholder, user can update via admin
      status: 'AVAILABLE',
      sortOrder: 1
    },
    {
      contentName: 'Habitación Doble Familiar la concepción',
      description: 'Habitación con 2 camas Queen. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_es: 'Habitación con 2 camas Queen. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata.',
      desc_en: 'Room with 2 Queen beds. Includes: Breakfast for four, pool access, bicycle ride, interaction with animals, fire pit access.',
      basePrice: 3700,
      capacity: 4,
      imageUrls: '/piscina.jpg', // Placeholder
      status: 'AVAILABLE',
      sortOrder: 2
    },
    {
      contentName: 'Master Suite Judah',
      description: 'Suite con cama King + sofá cama doble. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata, Fogata privada.',
      desc_es: 'Suite con cama King + sofá cama doble. Incluye: Desayuno para cuatro personas, Acceso a la piscina, Paseo en bicicleta, Interacción con nuestros animales, Acceso al área de fogata, Fogata privada.',
      desc_en: 'Suite with King bed + double sofa bed. Includes: Breakfast for four, pool access, bicycle ride, interaction with animals, fire pit access, private fire pit.',
      basePrice: 4190,
      capacity: 4,
      imageUrls: '/hero.jpg', // Placeholder
      status: 'AVAILABLE',
      sortOrder: 3
    }
  ];

  for (const room of rooms) {
    await prisma.room.create({ data: room });
  }

  console.log('Database updated with new room categories.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
