import { prisma } from './src/lib/prisma';

async function main() {
  // 1. Update Ortencias
  const ortencias = await prisma.room.findFirst({
    where: { contentName: 'Habitación Ortencias' }
  });

  if (ortencias) {
    const urls = ortencias.imageUrls.split('|');
    if (urls.length >= 4) {
      // Move 4th image (index 3) to front
      const img4 = urls.splice(3, 1)[0];
      urls.unshift(img4);
      await prisma.room.update({
        where: { id: ortencias.id },
        data: { imageUrls: urls.join('|') }
      });
      console.log('Ortencias updated successfully.');
    } else {
      console.log('Ortencias does not have 4 images.');
    }
  }

  // 2. Add Doble Queen
  const dobleQueenExists = await prisma.room.findFirst({
    where: { contentName: 'Habitación Doble Queen' }
  });

  if (!dobleQueenExists) {
    const newUrls = [
      '/rooms/doble-queen/principal.jpeg',
      '/rooms/doble-queen/imagen_2.jpeg',
      '/rooms/doble-queen/imagen_3.jpeg',
      '/rooms/doble-queen/imagen_4.jpeg',
      '/rooms/doble-queen/imagen_5.jpeg'
    ].join('|');

    await prisma.room.create({
      data: {
        contentName: 'Habitación Doble Queen',
        description: 'Habitación Doble Queen',
        basePrice: 2800,
        capacity: 4,
        imageUrls: newUrls,
        status: 'AVAILABLE',
        featured: false,
        sortOrder: 6,
        desc_es: 'Habitación con 2 camas Queen size. Incluye: Desayuno, Paseos en bicicleta, Interacción con animales, Piscina, Área de fogata, WiFi de alta velocidad, A/C y agua caliente.',
        desc_en: 'Room with 2 Queen size beds. Includes: Breakfast, Bicycle rides, Animal interaction, Pool access, Fire pit area, High-speed WiFi, A/C and hot water.'
      }
    });
    console.log('Doble Queen added successfully.');
  } else {
    console.log('Doble Queen already exists.');
  }
}

main().catch(console.error);
