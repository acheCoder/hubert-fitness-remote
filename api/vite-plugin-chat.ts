import Groq from 'groq-sdk';
import { HUBERT_KNOWLEDGE_BASE } from './knowledgeBase';
import type { Plugin } from 'vite';

interface ChatBody {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
}

export function chatApiPlugin(): Plugin {
  return {
    name: 'chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        // CORS para Module Federation (host en otro puerto)
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
          return;
        }

        // Parse body
        let body: ChatBody;
        try {
          const chunks: Buffer[] = [];
          for await (const chunk of req) chunks.push(chunk as Buffer);
          body = JSON.parse(Buffer.concat(chunks).toString());
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
          return;
        }

        const { message, history = [] } = body;
        if (!message || typeof message !== 'string') {
          res.statusCode = 400;
          res.end(JSON.stringify({ success: false, error: 'Message is required' }));
          return;
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: 'GROQ_API_KEY not set' }));
          return;
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

          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          res.end(JSON.stringify({ success: true, reply }));
        } catch (error: unknown) {
          const errMsg = error instanceof Error ? error.message : 'Unknown error';
          console.error('Groq API error:', errMsg);
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: errMsg }));
        }
      });
    },
  };
}
