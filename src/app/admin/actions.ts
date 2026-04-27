'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import nodemailer from 'nodemailer';

// RESERVATIONS
export async function updateReservationStatus(id: string, status: string) {
  const reservation = await prisma.reservation.update({
    where: { id },
    data: { status },
    include: { guest: true, room: true }
  });

  // SEND CONFIRMATION EMAIL IF CONFIRMED
  if (status === 'CONFIRMED' && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const logoUrl = 'https://casajudahfarmhotel.com/logo_dark_final.png';

      const mailOptions = {
        from: `"Casa Judah" <${process.env.EMAIL_USER}>`,
        to: reservation.guest.email,
        subject: `Tu Reservación está Confirmada - Casa Judah`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
            <div style="text-align: center; padding: 30px 20px; background-color: #fcfbf9; border-bottom: 2px solid #D6BE9B;">
              <img src="${logoUrl}" alt="Casa Judah Logo" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: #4E583E; margin: 0; font-size: 24px;">¡Reservación Confirmada!</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <p>Hola <strong>${reservation.guest.name}</strong>,</p>
              <p>Nos alegra informarte que tu pago/comprobante ha sido verificado y tu reservación está oficialmente <strong>CONFIRMADA</strong>.</p>
              
              <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4E583E;">
                <p style="margin: 5px 0;"><strong>Alojamiento:</strong> ${reservation.room.contentName}</p>
                <p style="margin: 5px 0;"><strong>Check-in:</strong> ${reservation.checkInDate.toLocaleDateString('es-HN')}</p>
                <p style="margin: 5px 0;"><strong>Check-out:</strong> ${reservation.checkOutDate.toLocaleDateString('es-HN')}</p>
                <p style="margin: 5px 0;"><strong>Total Pagado:</strong> L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(reservation.totalPrice)}</p>
              </div>

              <p>Recuerda que nuestro horario de check-in es a partir de las <strong>3:00 PM</strong>. Te esperamos para que disfrutes de una experiencia de descanso y conexión orgánica.</p>
              
              <p style="margin-top: 40px;">Con cariño,<br/><strong>El equipo de Casa Judah</strong></p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px 20px; text-align: center; font-size: 11px; color: #888;">
              <p style="margin: 0;">Este es un correo autogenerado por el sistema de reservas de Casa Judah. Por favor, no respondas a este correo.</p>
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(err => console.error("Admin Email failed:", err));
    } catch (err) {
      console.error("Nodemailer init error in admin:", err);
    }
  }

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
  const reservation = await prisma.amenityReservation.update({
    where: { id },
    data: { status },
    include: { amenity: true }
  });

  // SEND CONFIRMATION EMAIL IF CONFIRMED
  if (status === 'CONFIRMED' && process.env.EMAIL_USER && process.env.EMAIL_PASS && reservation.guestEmail) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const logoUrl = 'https://casajudahfarmhotel.com/logo_dark_final.png';

      const mailOptions = {
        from: `"Casa Judah" <${process.env.EMAIL_USER}>`,
        to: reservation.guestEmail,
        subject: `Tu Reservación de Amenidad Confirmada - Casa Judah`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
            <div style="text-align: center; padding: 30px 20px; background-color: #fcfbf9; border-bottom: 2px solid #D6BE9B;">
              <img src="${logoUrl}" alt="Casa Judah Logo" style="max-height: 80px; margin-bottom: 10px;" />
              <h1 style="color: #4E583E; margin: 0; font-size: 24px;">¡Reservación Confirmada!</h1>
            </div>
            
            <div style="padding: 30px 20px;">
              <p>Hola <strong>${reservation.guestName}</strong>,</p>
              <p>Nos alegra informarte que tu pago/comprobante ha sido verificado y tu reservación de amenidad está oficialmente <strong>CONFIRMADA</strong>.</p>
              
              <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4E583E;">
                <p style="margin: 5px 0;"><strong>Amenidad:</strong> ${reservation.amenity.title_es}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> ${reservation.date.toLocaleDateString('es-HN')}</p>
                <p style="margin: 5px 0;"><strong>Horario:</strong> ${reservation.timeSlot}</p>
                <p style="margin: 5px 0;"><strong>Invitados:</strong> ${reservation.guests}</p>
                <p style="margin: 5px 0;"><strong>Total Pagado:</strong> L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(reservation.totalPrice)}</p>
              </div>

              <p>Te esperamos para que disfrutes de una gran experiencia en Casa Judah.</p>
              
              <p style="margin-top: 40px;">Con cariño,<br/><strong>El equipo de Casa Judah</strong></p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px 20px; text-align: center; font-size: 11px; color: #888;">
              <p style="margin: 0;">Este es un correo autogenerado por el sistema de reservas de Casa Judah. Por favor, no respondas a este correo.</p>
            </div>
          </div>
        `
      };

      transporter.sendMail(mailOptions).catch(err => console.error("Admin Email Amenity failed:", err));
    } catch (err) {
      console.error("Nodemailer init error in admin amenity:", err);
    }
  }

  revalidatePath('/admin/reservations');
}
