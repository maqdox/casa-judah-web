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

export async function updateRoom(id: string, data: { contentName: string, basePrice: number, capacity: number, imageUrls: string, status: string, desc_es?: string, desc_en?: string }) {
  await prisma.room.update({
    where: { id },
    data: {
      contentName: data.contentName,
      basePrice: data.basePrice,
      capacity: data.capacity,
      imageUrls: data.imageUrls,
      status: data.status,
      desc_es: data.desc_es,
      desc_en: data.desc_en
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

// AMENITIES
export async function createAmenity(data: { title_es: string, title_en: string, desc_es: string, desc_en: string, price: number }) {
  const count = await prisma.amenity.count();
  await prisma.amenity.create({
    data: {
      ...data,
      imageUrl: '/exterior.jpg',
      sortOrder: count + 1,
    }
  });
  revalidatePath('/admin/amenities');
}

export async function updateAmenity(id: string, data: { title_es?: string, title_en?: string, desc_es?: string, desc_en?: string, price?: number, isActive?: boolean }) {
  await prisma.amenity.update({ where: { id }, data });
  revalidatePath('/admin/amenities');
}

export async function deleteAmenity(id: string) {
  await prisma.amenityReservation.deleteMany({ where: { amenityId: id } });
  await prisma.amenity.delete({ where: { id } });
  revalidatePath('/admin/amenities');
  revalidatePath('/admin/reservations');
}

// AMENITY RESERVATIONS
export async function createAmenityReservation(data: {
  amenityId: string, guestName: string, guestPhone?: string, guestEmail?: string,
  date: string, timeSlot: string, guests: number, totalPrice: number, notes?: string
}) {
  await prisma.amenityReservation.create({
    data: {
      amenityId: data.amenityId,
      guestName: data.guestName,
      guestPhone: data.guestPhone || null,
      guestEmail: data.guestEmail || null,
      date: new Date(data.date),
      timeSlot: data.timeSlot,
      guests: data.guests,
      totalPrice: data.totalPrice,
      notes: data.notes || null,
    }
  });
  revalidatePath('/admin/reservations');
}

export async function updateAmenityReservationStatus(id: string, status: string) {
  await prisma.amenityReservation.update({ where: { id }, data: { status } });
  revalidatePath('/admin/reservations');
}
