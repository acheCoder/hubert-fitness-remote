import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  goal: string;
  message: string;
  subject?: string;
  from_name?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  const { name, email, phone, goal, message, subject, from_name } = req.body as ContactPayload;

  if (process.env.NODE_ENV !== 'production') {
    console.log('[Contact API] Received:', { name, email, phone, goal, message });
  }

  // Validar campos requeridos (al menos email y message)
  if (!email || !message) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Contact API] Missing required fields:', { email, message });
    }
    return res.status(400).json({
      success: false,
      message: 'Email and message are required',
    });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('[Contact API] CRITICAL: RESEND_API_KEY is missing in the environment.');
    return res.status(500).json({
      success: false,
      message: 'Email service is not configured',
    });
  }

  try {
    const result = await resend.emails.send({
      from: from_name ? `${from_name} <onboarding@resend.dev>` : 'onboarding@resend.dev',
      to: 'infohubertfit@gmail.com',
      replyTo: email,
      subject: subject || `[Huberfit] Nuevo lead: ${name}`,
      html: `
        <h2>Nuevo contacto desde Huberfit</h2>
        ${name ? `<p><strong>Nombre:</strong> ${name}</p>` : ''}
        <p><strong>Email:</strong> ${email}</p>
        ${phone ? `<p><strong>Teléfono:</strong> ${phone}</p>` : ''}
        ${goal ? `<p><strong>Objetivo:</strong> ${goal}</p>` : ''}
        <p><strong>Mensaje:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    if (result.error) {
      console.error('Resend error:', result.error);
      return res.status(500).json({
        success: false,
        message: 'Error sending email',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      id: result.data?.id,
    });
  } catch (error) {
    console.error('Contact API error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}
