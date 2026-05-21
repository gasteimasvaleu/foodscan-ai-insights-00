import { Brain, Heart, Dumbbell, Utensils, Moon, type LucideIcon } from "lucide-react";

export interface MusicCategory {
  key: "foco" | "relaxar" | "treino" | "refeicao" | "sono";
  label: string;
  icon: LucideIcon;
}

export const MUSIC_CATEGORIES: MusicCategory[] = [
  { key: "foco", label: "Foco", icon: Brain },
  { key: "relaxar", label: "Relaxar", icon: Heart },
  { key: "treino", label: "Treino", icon: Dumbbell },
  { key: "refeicao", label: "Refeição Consciente", icon: Utensils },
  { key: "sono", label: "Sono", icon: Moon },
];

export const getMusicCategory = (key: string): MusicCategory | undefined =>
  MUSIC_CATEGORIES.find((c) => c.key === key);
