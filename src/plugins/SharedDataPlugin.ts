import { registerPlugin } from '@capacitor/core';

export interface SharedDataPlugin {
  saveWidgetData(data: {
    caloriesTarget: number;
    caloriesConsumed: number;
    caloriesRemaining: number;
    proteinsTarget: number;
    proteinsConsumed: number;
    carbsTarget: number;
    carbsConsumed: number;
    fatsTarget: number;
    fatsConsumed: number;
    mealsCount: number;
    hydrationMl: number;
    hydrationTarget: number;
    lastUpdate: string;
  }): Promise<{ success: boolean }>;
  clearWidgetData(): Promise<{ success: boolean }>;
}

const SharedData = registerPlugin<SharedDataPlugin>('SharedData');

export default SharedData;
