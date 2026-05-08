import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import './FitnessAIChat.scss';

type Message = { role: 'user' | 'assistant'; content: string };

const HUMAN_FALLBACK_TRIGGER = '[TRIGGER_HUMAN_FALLBACK]';
const FALLBACK_MSG =
  'Esa consulta es muy específica para analizar tu caso en detalle. Déjame tu email y Hubert te responderá personalmente lo antes posible.';

const FitnessAIChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '¡Hola! Soy el asistente de HubertFit. ¿En qué puedo ayudarte?' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAskingEmail, setIsAskingEmail] = useState(false);
  const [email, setEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const chatApiUrl = import.meta.env.VITE_CHAT_API_URL || '/api/chat';
      const res = await fetch(chatApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: [...messages, userMsg] }),
      });
      const data = await res.json();
      const reply: string = data.reply ?? '';

      if (reply.includes(HUMAN_FALLBACK_TRIGGER)) {
        setIsAskingEmail(true);
        setMessages((prev) => [...prev, { role: 'assistant', content: FALLBACK_MSG }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: `¡Perfecto! He anotado tu email (${email}). Hubert se pondrá en contacto contigo pronto. 💪` },
    ]);
    setIsAskingEmail(false);
    setEmail('');
  };

  return (
    <div className="hf-chat-widget">
      {/* Floating toggle button */}
      <button
        className={`hf-chat-widget__toggle ${isOpen ? 'hf-chat-widget__toggle--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="hf-chat">
          {/* Header */}
          <div className="hf-chat__header">
            <span className="hf-chat__header-dot" />
            <span className="hf-chat__header-title">HubertFit AI</span>
          </div>

          {/* Messages */}
          <div className="hf-chat__messages">
            {messages.map((msg, i) => (
              <div key={i} className={`hf-chat__bubble hf-chat__bubble--${msg.role}`}>
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="hf-chat__bubble hf-chat__bubble--assistant hf-chat__bubble--loading">
                <span className="hf-chat__dot" />
                <span className="hf-chat__dot" />
                <span className="hf-chat__dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="hf-chat__footer">
            {!isAskingEmail ? (
              <div className="hf-chat__input-row">
                <input
                  type="text"
                  className="hf-chat__input"
                  placeholder="Escribe tu mensaje..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isLoading}
                />
                <button
                  className="hf-chat__send"
                  onClick={sendMessage}
                  disabled={isLoading || !inputValue.trim()}
                  aria-label="Enviar mensaje"
                >
                  <Send size={18} />
                </button>
              </div>
            ) : (
              <form className="hf-chat__email-form" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  className="hf-chat__email-input"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="hf-chat__email-btn">
                  Enviar a Hubert
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FitnessAIChat;
