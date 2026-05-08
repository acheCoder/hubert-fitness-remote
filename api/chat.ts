import Groq from 'groq-sdk';
import { HUBERT_KNOWLEDGE_BASE } from './knowledgeBase';

interface ChatRequestBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export default async function handler(
  req: { method: string; body: ChatRequestBody },
  res: { status: (code: number) => { json: (data: unknown) => void } },
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ success: false, error: 'GROQ_API_KEY not configured' });
  }

  try {
    const groq = new Groq({ apiKey });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: HUBERT_KNOWLEDGE_BASE },
      ...history.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    const reply = chatCompletion.choices[0]?.message?.content || '';

    return res.status(200).json({ success: true, reply });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Groq API error:', errMsg);
    return res.status(500).json({ success: false, error: errMsg });
  }
}
