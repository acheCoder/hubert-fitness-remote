import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HUBERT_KNOWLEDGE_BASE } from './knowledgeBase.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body ?? {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('CRITICAL ERROR: GROQ_API_KEY is missing in Vercel environment.');
    return res.status(200).json({
      success: true,
      reply: 'Lo siento, el servicio de IA no está disponible en este momento. Por favor, contacta directamente con Hubert.',
    });
  }

  try {
    const messages = [
      { role: 'system', content: HUBERT_KNOWLEDGE_BASE },
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('Groq API error:', response.status, errData);
      return res.status(200).json({
        success: true,
        reply: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.',
      });
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '';

    return res.status(200).json({ success: true, reply });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Groq API error:', errMsg);
    return res.status(200).json({
      success: true,
      reply: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.',
    });
  }
}
