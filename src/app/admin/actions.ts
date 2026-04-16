'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';

// RESERVATIONS
export async function updateReservationStatus(id: string, status: string) {
  await prisma.reservation.update({
    where: { id },
    data: { status }
  });
  revalidatePath('/admin/reservations');
}

// THEME / SETTINGS
export async function updateSetting(key: string, value: string) {
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });
  revalidatePath('/', 'layout'); // Revalidate all front-end
  revalidatePath('/admin');
}

// ROOMS
export async function createRoom(data: { contentName: string, basePrice: number, capacity: number, imageUrls: string }) {
  const count = await prisma.room.count();
  const newRoom = await prisma.room.create({
    data: {
      contentName: data.contentName,
      description: 'Ingresa una descripción...',
      basePrice: data.basePrice,
      capacity: data.capacity,
      imageUrls: data.imageUrls || '/exterior.jpg',
      status: 'UNAVAILABLE',
      sortOrder: count + 1
    }
  });
  
  revalidatePath('/admin/rooms');
  revalidatePath('/[lang]/rooms', 'page');
  return newRoom.id;
}

export async function updateRoom(id: string, data: { contentName: string, basePrice: number, capacity: number, imageUrls: string, status: string }) {
  await prisma.room.update({
    where: { id },
    data: {
      contentName: data.contentName,
      basePrice: data.basePrice,
      capacity: data.capacity,
      imageUrls: data.imageUrls,
      status: data.status
    }
  });
  revalidatePath('/admin/rooms');
  revalidatePath('/[lang]/rooms', 'page');
}

// CONTENT
export async function updateContent(section: string, key: string, value: string) {
  // 1. Guardar la versión original (Español)
  await prisma.siteContent.upsert({
    where: { section_key: { section, key } },
    update: { value },
    create: { section, key, value }
  });

  // 2. Auto-traducción mágica por debajo si la llave termina en _es
  if (key.endsWith('_es') && value.trim() !== '') {
    const keyEn = key.replace('_es', '_en');
    
    try {
      // Uso de un API de traducción gratuito
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(value)}&langpair=es|en`);
      const data = await res.json();
      
      if (data && data.responseData && data.responseData.translatedText) {
        const translated = data.responseData.translatedText;
        
        // Guardar la versión en inglés de forma invisible
        await prisma.siteContent.upsert({
          where: { section_key: { section, key: keyEn } },
          update: { value: translated },
          create: { section, key: keyEn, value: translated }
        });
      }
    } catch (e) {
      console.error("No se pudo autotraducir", e);
    }
  }

  revalidatePath('/admin/content');
  revalidatePath('/[lang]', 'page');
}

// MEDIA
export async function uploadMedia(data: FormData) {
  const file: File | null = data.get('file') as unknown as File;
  
  if (!file) {
    throw new Error('No file uploaded');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Normalizamos el nombre del archivo eliminando espacios
  const fileName = file.name.replace(/\s+/g, '_');
  const path = join(process.cwd(), 'public', 'media', fileName);
  
  // Guardamos en el FileSystem local por ahora
  await writeFile(path, buffer);
  
  // Registramos en la Base de Datos
  await prisma.mediaItem.create({
    data: {
      url: `/media/${fileName}`,
      filename: fileName,
      altText: fileName,
    }
  });

  revalidatePath('/admin/media');
}
