import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import SharedData from '@/plugins/SharedDataPlugin';
import type { DailyGoal, MealRecord } from '@/pages/DailyControl';

interface WidgetSyncParams {
  goals: DailyGoal | null;
  meals: MealRecord[];
  hydrationTotals: { calories: number; carbohydrates: number };
  hydrationMl?: number;
  hydrationTarget?: number;
}

export const useWidgetSync = ({ goals, meals, hydrationTotals, hydrationMl = 0, hydrationTarget = 2000 }: WidgetSyncParams) => {
  useEffect(() => {
    if (Capacitor.getPlatform() !== 'ios' || !goals) return;

    const consumed = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        carbohydrates: acc.carbohydrates + meal.carbohydrates,
        proteins: acc.proteins + meal.proteins,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, carbohydrates: 0, proteins: 0, fats: 0 }
    );

    const totalCalories = Math.round(consumed.calories + hydrationTotals.calories);
    const totalCarbs = Math.round(consumed.carbohydrates + hydrationTotals.carbohydrates);

    SharedData.saveWidgetData({
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
    }).catch((err) => {
      console.warn('[WidgetSync] Failed to sync:', err);
    });
  }, [goals, meals, hydrationTotals, hydrationMl, hydrationTarget]);
};
