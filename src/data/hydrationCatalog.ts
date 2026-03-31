export interface HydrationBeverage {
  key: string;
  name: string;
  hydrationFactor: number;
  defaultCaloriesPer100ml: number;
  defaultVolumeOptions: number[];
  icon: string;
}

export const hydrationCatalog: HydrationBeverage[] = [
  {
    key: "water",
    name: "Água",
    hydrationFactor: 100,
    defaultCaloriesPer100ml: 0,
    defaultVolumeOptions: [200, 300, 500],
    icon: "💧",
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
    key: "juice",
    name: "Suco",
    hydrationFactor: 60,
    defaultCaloriesPer100ml: 45,
    defaultVolumeOptions: [200, 300, 400],
    icon: "🧃",
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
    key: "beer",
    name: "Cerveja",
    hydrationFactor: -120,
    defaultCaloriesPer100ml: 43,
    defaultVolumeOptions: [269, 350, 473],
    icon: "🍺",
  },
  {
    key: "rum",
    name: "Rum",
    hydrationFactor: -300,
    defaultCaloriesPer100ml: 231,
    defaultVolumeOptions: [50, 100, 150],
    icon: "🥃",
  },
];