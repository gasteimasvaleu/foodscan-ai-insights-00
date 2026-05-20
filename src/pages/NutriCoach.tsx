import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Bot, User, Loader2, MessageCircle } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import ReactMarkdown from 'react-markdown';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatInputBar } from '@/components/chat/ChatInputBar';

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

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim();
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
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex-1 flex flex-col min-h-0 px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-28 max-w-3xl mx-auto w-full">
        {/* Card título */}
        <div className="shrink-0 bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-primary">NutriCoach</h1>
        </div>

        {/* Chat inline */}
        <div className="mt-4 mb-4 flex-1 flex flex-col min-h-0 rounded-2xl bg-white border border-primary/20 shadow-sm overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-4 min-w-0">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 min-w-0 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[78%] min-w-0 rounded-2xl px-3 py-2.5 text-sm break-words overflow-hidden ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none min-w-0 break-words overflow-hidden [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2 [word-break:break-word] [overflow-wrap:anywhere]">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap break-words min-w-0" style={{ overflowWrap: 'anywhere' }}>{msg.content}</p>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="shrink-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-3.5 h-3.5 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2 justify-start min-w-0">
                <div className="shrink-0 w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-3 py-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 shrink-0 min-w-0">
            <ChatInputBar
              onSend={(text) => send(text)}
              placeholder="Pergunte sobre nutrição ou treinos..."
              isLoading={isLoading}
              enableAttachments={false}
              enableVoice
            />
          </div>
        </div>
      </div>
    </div>
  );
};


export default NutriCoach;
