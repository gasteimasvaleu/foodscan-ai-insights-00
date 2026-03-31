export interface HydrationBeverage {
  key: string;
  name: string;
  hydrationFactor: number;
  defaultCaloriesPer100ml: number;
  defaultCarbohydratesPer100ml?: number;
  defaultVolumeOptions: number[];
  icon: string;
}

export interface HydrationNutritionInput {
  beverage_key: string;
  volume_ml: number;
  calories?: number;
}

const baseHydrationCatalog: HydrationBeverage[] = [
  {
    key: "water",
    name: "Água",
    hydrationFactor: 100,
    defaultCaloriesPer100ml: 0,
    defaultVolumeOptions: [200, 300, 500],
    icon: "💧",
  },
  {
    key: "bottle_water",
    name: "Garrafa de água",
    hydrationFactor: 100,
    defaultCaloriesPer100ml: 0,
    defaultVolumeOptions: [500, 1000, 2000],
    icon: "🧴",
  },
  {
    key: "sparkling_water",
    name: "Água com gás",
    hydrationFactor: 95,
    defaultCaloriesPer100ml: 0,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🫧",
  },
  {
    key: "coconut_water",
    name: "Água de coco",
    hydrationFactor: 80,
    defaultCaloriesPer100ml: 19,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🥥",
  },
  {
    key: "tea",
    name: "Chá",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 2,
    defaultVolumeOptions: [200, 300, 400],
    icon: "🍵",
  },
  {
    key: "black_tea",
    name: "Chá preto",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🫖",
  },
  {
    key: "green_tea",
    name: "Chá verde",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🍃",
  },
  {
    key: "fruit_tea",
    name: "Chá de frutas",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 12,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🍓",
  },
  {
    key: "herbal_tea",
    name: "Chá de ervas",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🌿",
  },
  {
    key: "decaf_tea",
    name: "Chá descafeinado",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🍵",
  },
  {
    key: "matcha",
    name: "Matcha",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 6,
    defaultVolumeOptions: [150, 250, 350],
    icon: "🍵",
  },
  {
    key: "coffee",
    name: "Café",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [100, 200, 300],
    icon: "☕",
  },
  {
    key: "espresso",
    name: "Expresso",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 7,
    defaultVolumeOptions: [30, 60, 100],
    icon: "☕",
  },
  {
    key: "decaf_coffee",
    name: "Café descafeinado",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [100, 200, 300],
    icon: "☕",
  },
  {
    key: "coffee_with_milk",
    name: "Café com leite",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 30,
    defaultVolumeOptions: [150, 250, 350],
    icon: "🥛",
  },
  {
    key: "cappuccino",
    name: "Cappuccino",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 40,
    defaultVolumeOptions: [150, 250, 350],
    icon: "☕",
  },
  {
    key: "chocolate_drink",
    name: "Chocolate",
    hydrationFactor: 85,
    defaultCaloriesPer100ml: 78,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🍫",
  },
  {
    key: "hot_chocolate",
    name: "Chocolate quente",
    hydrationFactor: 80,
    defaultCaloriesPer100ml: 85,
    defaultVolumeOptions: [200, 300, 500],
    icon: "☕",
  },
  {
    key: "juice",
    name: "Suco",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 45,
    defaultVolumeOptions: [200, 300, 400],
    icon: "🧃",
  },
  {
    key: "syrup_drink",
    name: "Calda",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 40,
    defaultVolumeOptions: [100, 200, 300],
    icon: "🍯",
  },
  {
    key: "lemonade",
    name: "Limonada",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 30,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🍋",
  },
  {
    key: "smoothie",
    name: "Smoothie",
    hydrationFactor: 70,
    defaultCaloriesPer100ml: 60,
    defaultVolumeOptions: [250, 350, 500],
    icon: "🥤",
  },
  {
    key: "milkshake",
    name: "Milkshake",
    hydrationFactor: 80,
    defaultCaloriesPer100ml: 110,
    defaultVolumeOptions: [250, 350, 500],
    icon: "🥤",
  },
  {
    key: "milk",
    name: "Leite",
    hydrationFactor: 100,
    defaultCaloriesPer100ml: 61,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🥛",
  },
  {
    key: "vegan_milk",
    name: "Leite vegano",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 50,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🥛",
  },
  {
    key: "skim_milk",
    name: "Leite desnatado",
    hydrationFactor: 91,
    defaultCaloriesPer100ml: 35,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🥛",
  },
  {
    key: "almond_milk",
    name: "Leite de amêndoas",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 15,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🌰",
  },
  {
    key: "oat_milk",
    name: "Leite de aveia",
    hydrationFactor: 89,
    defaultCaloriesPer100ml: 45,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🌾",
  },
  {
    key: "soy_milk",
    name: "Leite de soja",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 45,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🫘",
  },
  {
    key: "coconut_milk",
    name: "Leite de coco",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 20,
    defaultVolumeOptions: [200, 300, 1000],
    icon: "🥥",
  },
  {
    key: "protein_shake",
    name: "Shake proteico",
    hydrationFactor: 80,
    defaultCaloriesPer100ml: 70,
    defaultVolumeOptions: [300, 500, 800],
    icon: "💪",
  },
  {
    key: "sports_drink",
    name: "Isotônico",
    hydrationFactor: 96,
    defaultCaloriesPer100ml: 24,
    defaultVolumeOptions: [300, 500, 1000],
    icon: "⚡",
  },
  {
    key: "soda",
    name: "Refrigerante",
    hydrationFactor: -50,
    defaultCaloriesPer100ml: 42,
    defaultVolumeOptions: [200, 350, 500],
    icon: "🥤",
  },
  {
    key: "diet_soda",
    name: "Refrigerante diet",
    hydrationFactor: 83,
    defaultCaloriesPer100ml: 1,
    defaultVolumeOptions: [200, 350, 500],
    icon: "🥤",
  },
  {
    key: "energy_drink",
    name: "Bebida energética",
    hydrationFactor: 55,
    defaultCaloriesPer100ml: 45,
    defaultVolumeOptions: [250, 350, 500],
    icon: "⚡",
  },
  {
    key: "kombucha",
    name: "Kombucha",
    hydrationFactor: 70,
    defaultCaloriesPer100ml: 20,
    defaultVolumeOptions: [200, 300, 500],
    icon: "🧉",
  },
  {
    key: "beer",
    name: "Cerveja",
    hydrationFactor: -120,
    defaultCaloriesPer100ml: 43,
    defaultVolumeOptions: [269, 350, 473],
    icon: "🍺",
  },
  {
    key: "alcohol_free_beer",
    name: "Cerveja sem álcool",
    hydrationFactor: 90,
    defaultCaloriesPer100ml: 26,
    defaultVolumeOptions: [269, 350, 473],
    icon: "🍺",
  },
  {
    key: "wine",
    name: "Vinho",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 83,
    defaultVolumeOptions: [150, 250, 750],
    icon: "🍷",
  },
  {
    key: "red_wine",
    name: "Vinho tinto",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 85,
    defaultVolumeOptions: [150, 250, 750],
    icon: "🍷",
  },
  {
    key: "white_wine",
    name: "Vinho branco",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 82,
    defaultVolumeOptions: [150, 250, 750],
    icon: "🥂",
  },
  {
    key: "rose_wine",
    name: "Vinho rosé",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 83,
    defaultVolumeOptions: [150, 250, 750],
    icon: "🌹",
  },
  {
    key: "cider",
    name: "Sidra",
    hydrationFactor: -40,
    defaultCaloriesPer100ml: 50,
    defaultVolumeOptions: [300, 500, 1000],
    icon: "🍎",
  },
  {
    key: "strong_liqueur",
    name: "Licor forte",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 300,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🍸",
  },
  {
    key: "cocktail",
    name: "Coquetel",
    hydrationFactor: -150,
    defaultCaloriesPer100ml: 170,
    defaultVolumeOptions: [100, 200, 300],
    icon: "🍹",
  },
  {
    key: "vermouth",
    name: "Vermute",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 140,
    defaultVolumeOptions: [50, 100, 150],
    icon: "🍷",
  },
  {
    key: "champagne",
    name: "Champanhe",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 75,
    defaultVolumeOptions: [100, 150, 200],
    icon: "🍾",
  },
  {
    key: "whiskey",
    name: "Uísque",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 250,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🥃",
  },
  {
    key: "brandy",
    name: "Conhaque",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 239,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🥃",
  },
  {
    key: "tequila",
    name: "Tequila",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 231,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🥃",
  },
  {
    key: "gin",
    name: "Gim",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 263,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🥃",
  },
  {
    key: "rum",
    name: "Rum",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 231,
    defaultVolumeOptions: [50, 100, 150],
    icon: "🥃",
  },
  {
    key: "vodka",
    name: "Vodca",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 231,
    defaultVolumeOptions: [30, 50, 100],
    icon: "🥃",
  },
  {
    key: "sake",
    name: "Saquê",
    hydrationFactor: -95,
    defaultCaloriesPer100ml: 134,
    defaultVolumeOptions: [50, 100, 180],
    icon: "🍶",
  },
];

const ESTIMATED_CARBS_PER_100ML: Record<string, number> = {
  water: 0,
  bottle_water: 0,
  sparkling_water: 0,
  coconut_water: 4,
  tea: 0,
  black_tea: 0,
  green_tea: 0,
  fruit_tea: 3,
  herbal_tea: 0,
  decaf_tea: 0,
  matcha: 1,
  coffee: 0,
  espresso: 1,
  decaf_coffee: 0,
  coffee_with_milk: 3,
  cappuccino: 5,
  chocolate_drink: 12,
  hot_chocolate: 13,
  juice: 11,
  syrup_drink: 10,
  lemonade: 7,
  smoothie: 12,
  milkshake: 18,
  milk: 5,
  vegan_milk: 6,
  skim_milk: 5,
  almond_milk: 1,
  oat_milk: 7,
  soy_milk: 4,
  coconut_milk: 1,
  protein_shake: 7,
  sports_drink: 6,
  soda: 11,
  diet_soda: 0,
  energy_drink: 11,
  kombucha: 5,
  beer: 3,
  alcohol_free_beer: 6,
  wine: 3,
  red_wine: 3,
  white_wine: 3,
  rose_wine: 3,
  cider: 6,
  strong_liqueur: 35,
  cocktail: 17,
  vermouth: 14,
  champagne: 2,
  whiskey: 0,
  brandy: 2,
  tequila: 0,
  gin: 0,
  rum: 0,
  vodka: 0,
  sake: 5,
};

export const hydrationCatalog: HydrationBeverage[] = baseHydrationCatalog.map((beverage) => ({
  ...beverage,
  defaultCarbohydratesPer100ml:
    typeof beverage.defaultCarbohydratesPer100ml === 'number'
      ? beverage.defaultCarbohydratesPer100ml
      : ESTIMATED_CARBS_PER_100ML[beverage.key] ?? Math.max(Math.round(beverage.defaultCaloriesPer100ml / 4), 0),
}));

export const getBeverageCarbsPer100ml = (beverageKey: string): number => {
  const beverage = hydrationCatalog.find((item) => item.key === beverageKey);
  if (!beverage) return 0;
  if (typeof beverage.defaultCarbohydratesPer100ml === 'number') {
    return beverage.defaultCarbohydratesPer100ml;
  }
  if (typeof ESTIMATED_CARBS_PER_100ML[beverageKey] === 'number') {
    return ESTIMATED_CARBS_PER_100ML[beverageKey];
  }
  return Math.max(Math.round(beverage.defaultCaloriesPer100ml / 4), 0);
};

export const calculateHydrationNutritionTotals = (records: HydrationNutritionInput[]) => {
  return records.reduce(
    (acc, record) => {
      const volume = Number(record.volume_ml) || 0;
      const caloriesFromRecord = Number(record.calories);
      const caloriesPer100ml =
        Number.isFinite(caloriesFromRecord) && caloriesFromRecord >= 0 && volume > 0
          ? (caloriesFromRecord / volume) * 100
          : hydrationCatalog.find((item) => item.key === record.beverage_key)?.defaultCaloriesPer100ml ?? 0;
      const carbsPer100ml = getBeverageCarbsPer100ml(record.beverage_key);

      acc.calories += Math.round((volume / 100) * caloriesPer100ml);
      acc.carbohydrates += Math.round((volume / 100) * carbsPer100ml);

      return acc;
    },
    { calories: 0, carbohydrates: 0 }
  );
};
