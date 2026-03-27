import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Send, Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type UserContext = {
  name?: string;
  calories?: number;
  proteins?: number;
  carbohydrates?: number;
  fats?: number;
  diet_objective?: string;
};

type Message = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/nutri-coach-chat`;

const WELCOME_MESSAGE: Message = {
  role: 'assistant',
  content: 'Olá! 👋 Eu sou o **NutriCoach**, seu assistente de nutrição e treinos! 💪🥗\n\nPosso te ajudar com:\n- 🍽️ Dicas de alimentação e dietas\n- 🏋️‍♂️ Planejamento de treinos\n- 📊 Contagem de macros e calorias\n- 💊 Orientações sobre suplementação\n\nComo posso te ajudar hoje?',
};

async function streamChat({
  messages,
  userContext,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  userContext?: UserContext;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, userContext }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: 'Erro de conexão' }));
    onError(err.error || 'Erro ao se comunicar com o assistente');
    return;
  }

  if (!resp.body) {
    onError('Resposta vazia do servidor');
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw) continue;
      if (raw.endsWith('\r')) raw = raw.slice(0, -1);
      if (raw.startsWith(':') || raw.trim() === '') continue;
      if (!raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const NutriCoach = () => {
  const { user, loading } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | undefined>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    const fetchContext = async () => {
      const [goalsRes, profileRes] = await Promise.all([
        supabase.from('daily_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
        supabase.from('profiles').select('name').eq('id', user.id).single(),
      ]);
      const goals = goalsRes.data?.[0];
      const profile = profileRes.data;
      if (goals || profile) {
        setUserContext({
          name: profile?.name,
          calories: goals?.calories,
          proteins: goals?.proteins,
          carbohydrates: goals?.carbohydrates,
          fats: goals?.fats,
          diet_objective: goals?.diet_objective,
        });
      }
    };
    fetchContext();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    const historyToSend = messages.slice(1).concat(userMsg);

    const upsertAssistant = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant' && prev.length > 1 && last !== WELCOME_MESSAGE) {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: 'assistant', content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: historyToSend,
        userContext,
        onDelta: upsertAssistant,
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast({ title: 'Erro', description: msg, variant: 'destructive' });
          setIsLoading(false);
        },
      });
    } catch {
      toast({ title: 'Erro', description: 'Falha ao conectar com o assistente', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 px-4 pt-20 pb-24 max-w-3xl mx-auto w-full space-y-4">
        {/* Card título */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">NutriCoach</h1>
        </div>

        {/* Card descrição */}
        <div className="bg-[#FFD1E7] rounded-3xl shadow-xl p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-[#FD46A1]" />
            <h2 className="text-lg font-bold text-gray-800">Seu Assistente de Nutrição</h2>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            Converse com o NutriCoach para receber orientações personalizadas sobre alimentação, dietas, treinos, contagem de macros e suplementação. Seu assistente de IA que conhece seus objetivos e metas!
          </p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>🍽️ Dicas de alimentação e dietas</li>
            <li>🏋️‍♂️ Planejamento de treinos</li>
            <li>📊 Contagem de macros e calorias</li>
            <li>💊 Orientações sobre suplementação</li>
          </ul>
          <Button
            onClick={() => setChatOpen(true)}
            className="w-full rounded-2xl bg-[#FD46A1] hover:bg-[#FD46A1]/90 text-white font-semibold py-3"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Abrir Chat
          </Button>
        </div>
      </div>

      {/* Chat Modal */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg h-[85dvh] rounded-2xl bg-white border-2 border-primary shadow-xl p-0 flex flex-col gap-0 overflow-hidden box-border !top-auto !bottom-0 !translate-y-0 !left-0 !translate-x-0 mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b bg-white rounded-t-2xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">NutriCoach</h2>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 rounded-b-2xl">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre nutrição ou treinos..."
                rows={1}
                className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-h-32 overflow-y-auto"
                style={{ minHeight: '44px' }}
              />
              <Button
                onClick={send}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-xl h-11 w-11 flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NutriCoach;
