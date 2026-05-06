import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-platform',
};

const FOODSCAN_DAILY_LIMIT = 3;
const todayISO = () => new Date().toISOString().slice(0, 10);

type QuotaResult =
  | { ok: true; commit: () => Promise<void> }
  | { ok: false; response: Response };

async function enforceFoodscanQuota(req: Request): Promise<QuotaResult> {
  const platform = req.headers.get('x-app-platform') ?? 'web';
  if (platform !== 'ios-native') return { ok: true, commit: async () => {} };
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }
  const token = authHeader.replace('Bearer ', '');
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
  const userClient = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token);
  if (claimsError || !claimsData?.claims?.sub) {
    return {
      ok: false,
      response: new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }),
    };
  }
  const userId = claimsData.claims.sub as string;
  const { data: sub } = await supabaseAdmin
    .from('subscribers')
    .select('subscribed')
    .eq('user_id', userId)
    .maybeSingle();
  if (sub?.subscribed) return { ok: true, commit: async () => {} };
  const today = todayISO();
  const { data: existing } = await supabaseAdmin
    .from('daily_usage_limits')
    .select('id, count')
    .eq('user_id', userId)
    .eq('feature', 'foodscan')
    .eq('usage_date', today)
    .maybeSingle();
  const currentCount = existing?.count ?? 0;
  if (currentCount >= FOODSCAN_DAILY_LIMIT) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ error: 'quota_exceeded', feature: 'foodscan' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      ),
    };
  }
  const commit = async () => {
    const newCount = currentCount + 1;
    if (existing) {
      await supabaseAdmin
        .from('daily_usage_limits')
        .update({ count: newCount })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('daily_usage_limits').insert({
        user_id: userId,
        feature: 'foodscan',
        usage_date: today,
        count: newCount,
      });
    }
  };
  return { ok: true, commit };
}

interface OpenFoodFactsProduct {
  product?: {
    product_name?: string;
    brands?: string;
    nutriments?: {
      'energy-kcal_100g'?: number;
      'carbohydrates_100g'?: number;
      'proteins_100g'?: number;
      'fat_100g'?: number;
      'fiber_100g'?: number;
      'sugars_100g'?: number;
      'salt_100g'?: number;
    };
    nutriscore_grade?: string;
    ingredients_text?: string;
  };
  status?: number;
}

const fetchWithRetry = async (url: string, options: any, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentativa ${attempt} de ${maxRetries} para ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Se sucesso, retornar resposta
      if (response.ok) {
        return response;
      }
      
      // Se 404, não tentar novamente
      if (response.status === 404) {
        return response;
      }
      
      // Para outros erros, continuar tentando
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      console.log(`Tentativa ${attempt} falhou:`, lastError.message);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // backoff exponencial
        console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
    } catch (error) {
      lastError = error;
      console.log(`Tentativa ${attempt} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

const validateBarcode = (barcode: string): boolean => {
  // Validar se é um código de barras válido (8, 12, 13 ou 14 dígitos)
  const cleanBarcode = barcode.replace(/\D/g, '');
  return /^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(cleanBarcode);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const quota = await enforceFoodscanQuota(req);
    if (!quota.ok) return quota.response;
    const { barcode } = await req.json();

    if (!barcode) {
      throw new Error('Código de barras é obrigatório');
    }

    // Validar formato do código de barras
    if (!validateBarcode(barcode)) {
      console.log('Código de barras com formato inválido:', barcode);
      return new Response(JSON.stringify({ 
        error: 'Código de barras inválido',
        message: 'O código de barras deve ter 8, 12, 13 ou 14 dígitos'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Buscando produto com código de barras:', barcode);

    // Fazer requisição para Open Food Facts com retry e timeout
    const response = await fetchWithRetry(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`,
      {
        headers: {
          'User-Agent': 'FoodScan/1.0 (https://app2.dietainteligente.app)',
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      }
    );

    console.log('Status da resposta da API:', response.status);
    
    if (!response.ok) {
      // Tratar 404 como produto não encontrado
      if (response.status === 404) {
        console.log('Produto não encontrado na API do Open Food Facts');
        return new Response(JSON.stringify({ 
          error: 'Produto não encontrado',
          message: 'O código de barras não foi encontrado na base de dados do Open Food Facts',
          canRetry: false,
          suggestAI: true
        }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Para outros erros, sugerir retry
      return new Response(JSON.stringify({ 
        error: 'Erro de conectividade',
        message: 'Problemas temporários com o servidor do Open Food Facts. Tente novamente em alguns momentos.',
        canRetry: true,
        suggestAI: true
      }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data: OpenFoodFactsProduct = await response.json();
    console.log('Resposta do Open Food Facts:', JSON.stringify(data, null, 2));

    if (!data.product || data.status === 0) {
      return new Response(JSON.stringify({ 
        error: 'Produto não encontrado',
        message: 'O código de barras não foi encontrado na base de dados do Open Food Facts'
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    // Processar dados nutricionais
    const nutrition = {
      calories: nutriments['energy-kcal_100g'] || 0,
      carbohydrates: nutriments['carbohydrates_100g'] || 0,
      proteins: nutriments['proteins_100g'] || 0,
      fats: nutriments['fat_100g'] || 0,
      fiber: nutriments['fiber_100g'] || 0,
      sodium: (nutriments['salt_100g'] || 0) * 1000 * 0.4, // Converter sal para sódio (mg)
    };

    // Verificar se os dados nutricionais estão completos
    const hasNutritionalData = Object.values(nutrition).some(value => value > 0);
    
    // Converter para o formato NutritionData usado pela aplicação
    const nutritionData = {
      foodName: product.product_name || product.brands || 'Produto não identificado',
      name: product.product_name || product.brands || 'Produto não identificado',
      description: `${product.brands ? `Marca: ${product.brands}. ` : ''}${product.ingredients_text ? `Ingredientes: ${product.ingredients_text}` : 'Ingredientes não disponíveis'}`,
      quantity: "100g",
      source: 'open-food-facts',
      nutriscore: product.nutriscore_grade?.toUpperCase(),
      brands: product.brands,
      barcode: barcode,
      hasNutritionalData,
      nutrition
    };

    console.log('Dados nutricionais processados:', nutritionData);

    return new Response(JSON.stringify(nutritionData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função open-food-facts:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      message: 'Erro ao buscar informações do produto' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});