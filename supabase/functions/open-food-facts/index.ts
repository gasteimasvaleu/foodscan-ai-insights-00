import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();

    if (!barcode) {
      throw new Error('Código de barras é obrigatório');
    }

    console.log('Buscando produto com código de barras:', barcode);

    // Fazer requisição para Open Food Facts com User-Agent correto
    const response = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: {
        'User-Agent': 'FoodScan/1.0 (https://app2.dietainteligente.app)',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Open Food Facts: ${response.status}`);
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

    // Converter para o formato NutritionData usado pela aplicação
    const nutritionData = {
      name: product.product_name || 'Produto não identificado',
      description: `${product.brands ? `Marca: ${product.brands}. ` : ''}${product.ingredients_text ? `Ingredientes: ${product.ingredients_text}` : 'Ingredientes não disponíveis'}`,
      calories: nutriments['energy-kcal_100g'] || 0,
      carbohydrates: nutriments['carbohydrates_100g'] || 0,
      proteins: nutriments['proteins_100g'] || 0,
      fats: nutriments['fat_100g'] || 0,
      fiber: nutriments['fiber_100g'] || 0,
      sugars: nutriments['sugars_100g'] || 0,
      sodium: (nutriments['salt_100g'] || 0) * 1000 * 0.4, // Converter sal para sódio (mg)
      portionGrams: 100, // Open Food Facts sempre retorna valores por 100g
      source: 'open-food-facts',
      nutriscore: product.nutriscore_grade?.toUpperCase(),
      brands: product.brands,
      barcode: barcode
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