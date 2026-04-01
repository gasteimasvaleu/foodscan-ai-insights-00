import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import SharedData from '@/plugins/SharedDataPlugin';
import { supabase } from '@/integrations/supabase/client';
import { calculateHydrationNutritionTotals } from '@/data/hydrationCatalog';

/**
 * Syncs widget data from Supabase on app launch and when returning from background.
 * Only runs on iOS with an authenticated user.
 */
export const useWidgetSyncOnLaunch = (userId: string | undefined) => {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios' || !userId) return;

    const syncWidget = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];

        const [goalsRes, mealsRes, hydrationRes, profileRes] = await Promise.all([
          supabase
            .from('daily_goals')
            .select('calories, proteins, carbohydrates, fats')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('meal_records')
            .select('calories, carbohydrates, proteins, fats')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00.000Z`)
            .lt('created_at', `${today}T23:59:59.999Z`),
          supabase
            .from('hydration_records')
            .select('beverage_key, volume_ml, calories, hydration_impact_ml')
            .eq('user_id', userId)
            .eq('consumption_date', today),
          supabase
            .from('profiles')
            .select('hydration_goal_ml')
            .eq('id', userId)
            .single(),
        ]);

        const goals = goalsRes.data;
        if (!goals) return; // No goals set, nothing to sync

        const meals = mealsRes.data || [];
        const hydrationRecords = hydrationRes.data || [];
        const hydrationTarget = profileRes.data?.hydration_goal_ml ?? 3000;

        const consumed = meals.reduce(
          (acc, m) => ({
            calories: acc.calories + (m.calories || 0),
            carbohydrates: acc.carbohydrates + (m.carbohydrates || 0),
            proteins: acc.proteins + (m.proteins || 0),
            fats: acc.fats + (m.fats || 0),
          }),
          { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 }
        );

        const hydrationNutrition = calculateHydrationNutritionTotals(hydrationRecords);
        const hydrationMl = hydrationRecords.reduce(
          (sum, r) => sum + (Number(r.hydration_impact_ml) || 0),
          0
        );

        const totalCalories = Math.round(consumed.calories + hydrationNutrition.calories);
        const totalCarbs = Math.round(consumed.carbohydrates + hydrationNutrition.carbohydrates);

        await SharedData.saveWidgetData({
          caloriesTarget: goals.calories,
          caloriesConsumed: totalCalories,
          caloriesRemaining: Math.max(0, goals.calories - totalCalories),
          proteinsTarget: goals.proteins,
          proteinsConsumed: Math.round(consumed.proteins),
          carbsTarget: goals.carbohydrates,
          carbsConsumed: totalCarbs,
          fatsTarget: goals.fats,
          fatsConsumed: Math.round(consumed.fats),
          mealsCount: meals.length,
          hydrationMl: Math.round(Math.max(0, hydrationMl)),
          hydrationTarget,
          lastUpdate: new Date().toISOString(),
        });

        console.log('[WidgetSyncOnLaunch] Synced successfully');
      } catch (err) {
        console.warn('[WidgetSyncOnLaunch] Failed:', err);
      }
    };

    // Sync immediately on mount
    syncWidget();

    // Sync when app returns from background
    const listener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) syncWidget();
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [userId]);
};
