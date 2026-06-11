'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

export async function createReservation(formData: FormData) {
  const roomIds = formData.getAll('roomIds') as string[];
  const checkInStr = formData.get('checkIn') as string;
  const checkOutStr = formData.get('checkOut') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const rulesAccepted = formData.get('rulesAccepted') === 'on';
  const paymentMethod = formData.get('paymentMethod') as string;

  if (roomIds.length === 0 || !checkInStr || !checkOutStr || !name || !email || !rulesAccepted) {
    throw new Error('Missing required fields.');
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  const overlapping = await prisma.reservation.findFirst({
    where: {
      roomId: { in: roomIds },
      status: { not: 'CANCELLED' },
      OR: [
        { checkInDate: { lte: checkOut }, checkOutDate: { gte: checkIn } }
      ]
    }
  });

  if (overlapping) {
    throw new Error('One or more rooms are already booked for these dates.');
  }

  const rooms = await prisma.room.findMany({ where: { id: { in: roomIds } } });
  if (rooms.length !== roomIds.length) throw new Error('Room not found.');

  const daysMs = checkOut.getTime() - checkIn.getTime();
  const days = Math.ceil(daysMs / (1000 * 60 * 60 * 24));
  if (days <= 0) throw new Error('Invalid dates.');

  const earlyCheckIn = formData.get('earlyCheckIn') === 'on';
  const lateCheckOut = formData.get('lateCheckOut') === 'on';

  let globalSubtotal = 0;
  let globalAddonsTotal = 0;

  if (earlyCheckIn) globalAddonsTotal += 500 * roomIds.length;
  if (lateCheckOut) globalAddonsTotal += 500 * roomIds.length;

  for (const r of rooms) {
    globalSubtotal += days * r.basePrice;
  }

  const globalTax = (globalSubtotal + globalAddonsTotal) * 0.15;
  const globalTotalPrice = globalSubtotal + globalAddonsTotal + globalTax;

  const reservations = await prisma.$transaction(async (tx) => {
    let guest = await tx.guest.findUnique({ where: { email } });
    if (!guest) {
      guest = await tx.guest.create({ data: { name, email, phone } });
    }

    let receiptUrl = null;
    const receiptFile = formData.get('receipt') as File | null;
    
    // Solo subimos el recibo una vez
    if (receiptFile && receiptFile.size > 0) {
      const bytes = await receiptFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = receiptFile.name.split('.').pop() || 'jpg';
      const filename = `receipt_${guest.id}_${Date.now()}.${ext}`;
      
      const { data, error } = await supabase.storage
        .from('receipts')
        .upload(filename, buffer, { contentType: receiptFile.type });
        
      if (data) {
        receiptUrl = supabase.storage.from('receipts').getPublicUrl(data.path).data.publicUrl;
      }
    }

    const createdRes = [];

    // Creamos la reservacion por cada habitacion
    for (const room of rooms) {
      const roomSubtotal = days * room.basePrice;
      let roomAddons = 0;
      if (earlyCheckIn) roomAddons += 500;
      if (lateCheckOut) roomAddons += 500;
      const roomTax = (roomSubtotal + roomAddons) * 0.15;
      const roomTotalPrice = roomSubtotal + roomAddons + roomTax;

      const res = await tx.reservation.create({
        data: {
          guestId: guest.id,
          roomId: room.id,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          rulesAccepted,
          totalPrice: roomTotalPrice,
          status: ['bank_transfer', 'payment_link'].includes(paymentMethod) ? 'PENDING' : 'CONFIRMED'
        }
      });

      let paymentAmount = roomTotalPrice;
      if (paymentMethod === 'partial_card') paymentAmount = roomTotalPrice / 2;
      if (paymentMethod === 'hotel') paymentAmount = 0;

      await tx.payment.create({
        data: {
          reservationId: res.id,
          amount: paymentAmount,
          paymentMethod,
          status: ['full_card', 'partial_card'].includes(paymentMethod) ? 'COMPLETED' : 'PENDING',
          receiptUrl
        }
      });
      createdRes.push(res);
    }

    return createdRes;
  });

  // FIRE EMAIL NOTIFICATION TIER
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && reservations.length > 0) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const roomNames = rooms.map(r => r.contentName).join(', ');

      const mailOptions = {
        from: `"Casa Judah" <${process.env.EMAIL_USER}>`,
        to: email, // Guest's email
        bcc: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Backup alert to Owner
        subject: `Casa Judah - Confirmación de Estadía #${reservations[0].id.substring(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #556B2F;">
              <h1 style="color: #556B2F; margin: 0;">Casa Judah</h1>
              <p style="font-style: italic; color: #666;">Refugio y Paz</p>
            </div>
            
            <div style="padding: 30px 20px;">
              <h2>¡Hola, ${name}!</h2>
              <p>Tu reservación ha sido guardada exitosamente. Estamos emocionados de recibirte.</p>
              
              <div style="background-color: #F8F9FA; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Alojamiento (${rooms.length}):</strong> ${roomNames}</p>
                <p><strong>Check-in:</strong> ${checkIn.toLocaleDateString()} ${earlyCheckIn ? '(Early Check-in 10:00 AM)' : ''}</p>
                <p><strong>Check-out:</strong> ${checkOut.toLocaleDateString()} ${lateCheckOut ? '(Late Check-out 2:00 PM)' : ''}</p>
                ${earlyCheckIn ? `<p><strong>Early Check-in (x${rooms.length}):</strong> L ${new Intl.NumberFormat('en-US').format(500 * rooms.length)}</p>` : ''}
                ${lateCheckOut ? `<p><strong>Late Check-out (x${rooms.length}):</strong> L ${new Intl.NumberFormat('en-US').format(500 * rooms.length)}</p>` : ''}
                <p><strong>Subtotal (Estadías + Servicios):</strong> L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(globalSubtotal + globalAddonsTotal)}</p>
                <p><strong>Impuestos (15%):</strong> L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(globalTax)}</p>
                <p><strong>Total:</strong> L ${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(globalTotalPrice)}</p>
                <p><strong>Método Acordado:</strong> ${paymentMethod.replace('_', ' ').toUpperCase()}</p>
              </div>

              <p>Si solicitaste Pago vía Link de WhatsApp o Transferencia, un agente se pondrá en contacto contigo muy pronto al número <strong>${phone}</strong> que nos proporcionaste.</p>
              
              <p style="margin-top: 40px;">Con cariño,<br/><strong>El equipo de Casa Judah</strong></p>
            </div>
          </div>
        `
      };

      // Dispatch async without waiting to lock the user flow
      transporter.sendMail(mailOptions).catch(err => console.error("Email failed:", err));
    } catch (err) {
      console.error("Nodemailer init error:", err);
    }
  }

  revalidatePath('/admin/reservations');
  revalidatePath('/admin');
  
  // Return the first reservation ID to use on the success page
  return reservations[0].id;
}
