import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// MET values for different activities and intensities
const MET_VALUES = {
  'Corrida': { 'Leve': 6.0, 'Moderada': 9.8, 'Intensa': 12.8 },
  'Caminhada': { 'Leve': 3.0, 'Moderada': 4.3, 'Intensa': 5.0 },
  'Natação': { 'Leve': 4.8, 'Moderada': 7.0, 'Intensa': 10.0 },
  'Ciclismo': { 'Leve': 4.0, 'Moderada': 8.0, 'Intensa': 12.0 },
  'Musculação': { 'Leve': 3.0, 'Moderada': 5.0, 'Intensa': 6.0 },
  'Yoga': { 'Leve': 2.5, 'Moderada': 3.0, 'Intensa': 4.0 },
  'Pilates': { 'Leve': 2.5, 'Moderada': 3.0, 'Intensa': 4.5 },
  'Futebol': { 'Leve': 7.0, 'Moderada': 8.0, 'Intensa': 10.0 },
  'Basquete': { 'Leve': 6.0, 'Moderada': 8.0, 'Intensa': 10.0 },
  'Tênis': { 'Leve': 5.0, 'Moderada': 7.0, 'Intensa': 8.0 },
  'Vôlei': { 'Leve': 3.0, 'Moderada': 4.0, 'Intensa': 6.0 },
  'Dança': { 'Leve': 3.0, 'Moderada': 4.8, 'Intensa': 7.0 },
  'Boxe': { 'Leve': 5.5, 'Moderada': 7.8, 'Intensa': 12.8 },
  'Escalada': { 'Leve': 5.0, 'Moderada': 8.0, 'Intensa': 11.0 },
  'Remo': { 'Leve': 3.5, 'Moderada': 7.0, 'Intensa': 12.0 },
  'Alongamento': { 'Leve': 2.3, 'Moderada': 2.3, 'Intensa': 2.3 },
  'Crossfit': { 'Leve': 5.0, 'Moderada': 8.0, 'Intensa': 12.0 },
  'Spinning': { 'Leve': 6.0, 'Moderada': 8.5, 'Intensa': 11.0 },
  'Aeróbica': { 'Leve': 5.0, 'Moderada': 7.0, 'Intensa': 10.0 },
  'Zumba': { 'Leve': 5.0, 'Moderada': 7.3, 'Intensa': 8.8 }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { activityType, weight, age, durationMinutes, intensity } = await req.json();

    console.log('Calculating calories for:', { activityType, weight, age, durationMinutes, intensity });

    // Get MET value for the activity and intensity
    const metValue = MET_VALUES[activityType]?.[intensity] || 5.0; // Default MET if not found

    // Basic formula: Calories = MET × weight (kg) × time (hours)
    let caloriesBurned = metValue * weight * (durationMinutes / 60);

    // Age adjustment factor (metabolism slows with age)
    const ageAdjustment = age < 30 ? 1.1 : age < 50 ? 1.0 : 0.9;
    caloriesBurned *= ageAdjustment;

    // Round to nearest whole number
    const finalCalories = Math.round(caloriesBurned);

    // Generate personalized recommendations
    let recommendations = [];
    
    if (finalCalories > 300) {
      recommendations.push("Excelente queima calórica! Você pode ajustar suas metas nutricionais hoje.");
    }
    
    if (intensity === 'Leve') {
      recommendations.push("Que tal aumentar a intensidade na próxima vez para queimar mais calorias?");
    }
    
    if (durationMinutes >= 60) {
      recommendations.push("Treino longo! Lembre-se de se hidratar bem e se alimentar adequadamente.");
    }

    const response = {
      caloriesBurned: finalCalories,
      metValue,
      recommendations,
      adjustmentSuggestion: `Você pode comer aproximadamente ${Math.round(finalCalories * 0.8)} calorias extras hoje devido ao exercício.`
    };

    console.log('Calculation result:', response);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in calculate-exercise-calories function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});