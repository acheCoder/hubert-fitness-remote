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
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

/**
 * API key de Web3Forms. En producción se inyecta via env var.
 * Genera la tuya gratis en https://web3forms.com
 */
const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY ?? '';

/**
 * Simula el envío en desarrollo (2s de delay).
 */
const simulateSend = async (_data: ContactPayload): Promise<ContactResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'Simulated OK' });
    }, 2000);
  });
};

/**
 * Envía el formulario de contacto a Web3Forms.
 */
export const sendContactForm = async (data: ContactPayload): Promise<ContactResponse> => {
  if (!WEB3FORMS_ACCESS_KEY) {
    console.info('[ContactService] No API key — simulando envío:', data);
    return simulateSend(data);
  }

  const body = {
    access_key: WEB3FORMS_ACCESS_KEY,
    subject: `[Huberfit] Nuevo lead: ${data.name}`,
    from_name: data.name,
    ...data,
  };

  const res = await fetch(WEB3FORMS_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return { success: false, message: `HTTP ${res.status}` };
  }

  const json = await res.json();
  return {
    success: json.success === true,
    message: json.message ?? 'Unknown',
  };
};
