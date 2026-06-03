/* ═══════════════════════════════════════════════════════════════
   ContactService — Servicio serverless para formulario Huberfit.
   Usa Web3Forms como proveedor externo.
   En desarrollo: simula la petición con un delay.
   ═══════════════════════════════════════════════════════════════ */

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  goal: string;
  message: string;
  subject?: string;
  from_name?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

/**
 * Endpoint serverless en Vercel para enviar correos con Resend
 */
const CONTACT_ENDPOINT = '/api/contact';

/**
 * Mock para desarrollo local (simula envío)
 */
const simulateSend = async (data: ContactPayload): Promise<ContactResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[ContactService] Mock: Email enviado a infohubertfit@gmail.com', data);
      resolve({ success: true, message: 'Email simulado (desarrollo)' });
    }, 1500);
  });
};

/**
 * Envía el formulario de contacto a través de Vercel Functions + Resend.
 */
export const sendContactForm = async (data: ContactPayload): Promise<ContactResponse> => {
  // En desarrollo, usa mock
  if (import.meta.env.DEV) {
    return simulateSend(data);
  }

  try {
    const res = await fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        goal: data.goal,
        message: data.message,
      }),
    });

    if (!res.ok) {
      return { success: false, message: `HTTP ${res.status}` };
    }

    const json = await res.json();
    return {
      success: json.success === true,
      message: json.message ?? 'Email sent successfully',
    };
  } catch (error) {
    console.error('[ContactService] Error:', error);
    return {
      success: false,
      message: 'Error sending email',
    };
  }
};
