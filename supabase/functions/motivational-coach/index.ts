import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userName } = await req.json();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Você é um dos melhores coaches motivacionais do mundo. Seu trabalho é inspirar e motivar pessoas a alcançarem seus objetivos de saúde e bem-estar. Seja caloroso, empático e energético. Use uma linguagem positiva e encorajadora. Mantenha as mensagens concisas (máximo 150 palavras) mas impactantes. Foque em alimentação saudável, exercícios e mindset positivo.` 
          },
          { 
            role: 'user', 
            content: `Olá! Acabei de fazer login no FoodScan AI. Meu nome é ${userName}. Me dê uma mensagem motivacional personalizada para começar minha jornada de saúde hoje!` 
          }
        ],
        max_tokens: 200,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const motivationalMessage = data.choices[0].message.content;

    return new Response(JSON.stringify({ message: motivationalMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in motivational-coach function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});