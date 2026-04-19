'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import nodemailer from 'nodemailer';

export async function createReservation(formData: FormData) {
  const roomId = formData.get('roomId') as string;
  const checkInStr = formData.get('checkIn') as string;
  const checkOutStr = formData.get('checkOut') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const rulesAccepted = formData.get('rulesAccepted') === 'on';
  const paymentMethod = formData.get('paymentMethod') as string;

  if (!roomId || !checkInStr || !checkOutStr || !name || !email || !rulesAccepted) {
    throw new Error('Missing required fields.');
  }

  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);

  const overlapping = await prisma.reservation.findFirst({
    where: {
      roomId,
      status: { not: 'CANCELLED' },
      OR: [
        { checkInDate: { lte: checkOut }, checkOutDate: { gte: checkIn } }
      ]
    }
  });

  if (overlapping) {
    throw new Error('The room is already booked for these dates.');
  }

  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) throw new Error('Room not found.');

  const daysMs = checkOut.getTime() - checkIn.getTime();
  const days = Math.ceil(daysMs / (1000 * 60 * 60 * 24));
  if (days <= 0) throw new Error('Invalid dates.');

  const subtotal = days * room.basePrice;
  const tax = subtotal * 0.15;
  const totalPrice = subtotal + tax;

  const reservation = await prisma.$transaction(async (tx) => {
    let guest = await tx.guest.findUnique({ where: { email } });
    if (!guest) {
      guest = await tx.guest.create({ data: { name, email, phone } });
    }

    const res = await tx.reservation.create({
      data: {
        guestId: guest.id,
        roomId: room.id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        rulesAccepted,
        totalPrice,
        status: ['bank_transfer', 'payment_link'].includes(paymentMethod) ? 'PENDING' : 'CONFIRMED'
      }
    });

    let paymentAmount = totalPrice;
    if (paymentMethod === 'partial_card') paymentAmount = totalPrice / 2;
    if (paymentMethod === 'hotel') paymentAmount = 0;

    await tx.payment.create({
      data: {
        reservationId: res.id,
        amount: paymentAmount,
        paymentMethod,
        status: ['full_card', 'partial_card'].includes(paymentMethod) ? 'COMPLETED' : 'PENDING'
      }
    });

    return res;
  });

  // FIRE EMAIL NOTIFICATION TIER
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"Casa Judah" <${process.env.EMAIL_USER}>`,
        to: email, // Guest's email
        bcc: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, // Backup alert to Owner
        subject: `Casa Judah - Confirmación de Estadía #${reservation.id.substring(0, 8)}`,
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
                <p><strong>Alojamiento:</strong> ${room.contentName}</p>
                <p><strong>Check-in:</strong> ${checkIn.toLocaleDateString()}</p>
                <p><strong>Check-out:</strong> ${checkOut.toLocaleDateString()}</p>
                <p><strong>Subtotal:</strong> L ${subtotal.toFixed(2)}</p>
                <p><strong>Impuestos (15%):</strong> L ${tax.toFixed(2)}</p>
                <p><strong>Total:</strong> L ${totalPrice.toFixed(2)}</p>
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
  
  return reservation.id;
}
