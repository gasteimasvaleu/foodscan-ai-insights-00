export interface DayData {
  day: number;
  title: string;
  summary: string;
  menu: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  motivationalMessage: string;
  videoUrl?: string;
}

const VIDEO_BASE_URL = "https://rajbgqkqctmyijtobesh.supabase.co/storage/v1/object/public/videos";

const getVideoUrl = (day: number) => `${VIDEO_BASE_URL}/Dia%20${day}.mp4`;

const baseDays: Omit<DayData, 'day' | 'title'>[] = [
  {
    summary: "Primeiro dia do desafio. Foco e determinação!",
    menu: {
      breakfast: "Café preto sem açúcar e sem adoçante",
      lunch: "2 ovos cozidos (apenas as claras) + folhas à vontade",
      dinner: "Salada de alface, pepino e salsão à vontade"
    },
    motivationalMessage: "O primeiro passo é sempre o mais difícil. Você está aqui! 💪"
  },
  {
    summary: "Segundo dia. Seu corpo está se adaptando.",
    menu: {
      breakfast: "Café + 2 biscoitos cream-cracker",
      lunch: "1 bife grande (sem gordura) + salada de frutas (sem banana, manga e abacate)",
      dinner: "Presunto à vontade"
    },
    motivationalMessage: "Seu corpo está se adaptando. Mantenha o foco! 🌟"
  },
  {
    summary: "Terceiro dia de força. Continue firme!",
    menu: {
      breakfast: "Café + 2 biscoitos cream-cracker",
      lunch: "2 ovos cozidos (apenas as claras) + salada de vagem + 2 torradas",
      dinner: "Presunto + salada de alface, pepino e salsão à vontade"
    },
    motivationalMessage: "Três dias de força! A disciplina está crescendo. ✨"
  },
  {
    summary: "Quarto dia. Novos hábitos sendo criados.",
    menu: {
      breakfast: "Café + 2 biscoitos cream-cracker",
      lunch: "1 ovo cozido (sem a gema) + 1 cenoura + queijo minas à vontade",
      dinner: "Salada de frutas (sem creme de leite ou leite condensado) + iogurte natural"
    },
    motivationalMessage: "Você está criando novos hábitos. Continue firme! 💫"
  },
  {
    summary: "Metade da primeira semana!",
    menu: {
      breakfast: "Café + 1 cenoura crua temperada com suco de limão",
      lunch: "Frango grelhado à vontade",
      dinner: "2 ovos cozidos (apenas a clara) + 1 cenoura"
    },
    motivationalMessage: "Metade da semana! Olha o quanto você já caminhou! 🎯"
  },
  {
    summary: "Sexto dia. Você é mais forte do que pensa!",
    menu: {
      breakfast: "Café + 2 biscoitos cream-cracker",
      lunch: "Filé de peixe + tomate à vontade",
      dinner: "2 ovos cozidos (apenas a clara) + 1 cenoura"
    },
    motivationalMessage: "Quase uma semana completa. Você é mais forte do que pensa! ⭐"
  },
  {
    summary: "UMA SEMANA COMPLETA! Parabéns! 🎉",
    menu: {
      breakfast: "Café com limão",
      lunch: "Bife grelhado + frutas à vontade",
      dinner: "Livre (exceto bebidas alcoólicas e doces)"
    },
    motivationalMessage: "UMA SEMANA! Parabéns pela primeira conquista! 🏆"
  }
];

const dayTitles = [
  "O Começo da Jornada",
  "Construindo o Hábito",
  "Fortalecendo a Mente",
  "Energia Renovada",
  "Metade da Primeira Semana",
  "Equilíbrio Interior",
  "Uma Semana Completa!",
  "Nova Semana, Nova Energia",
  "Persistência é Tudo",
  "Reta Final à Vista",
  "Força Interior",
  "Quase Lá",
  "Véspera da Vitória",
  "VOCÊ CONSEGUIU! 🎉"
];

const week2Messages = [
  "Segunda semana começando! Você está arrasando! 💪",
  "A persistência é a chave. Continue! 🌈",
  "Reta final à vista! Faltam só 4 dias! 🎯",
  "Sua determinação é inspiradora! ⭐",
  "Faltam 2 dias! Você consegue! 🔥",
  "Amanhã é o grande dia! Força total! 💫",
  "VOCÊ CONSEGUIU! 14 DIAS DE DEDICAÇÃO! 🏆🎉✨"
];

export const challengeData: DayData[] = Array.from({ length: 14 }, (_, i) => {
  const baseIndex = i % 7;
  const base = baseDays[baseIndex];
  const isSecondWeek = i >= 7;
  
  return {
    day: i + 1,
    title: dayTitles[i],
    summary: isSecondWeek && i === 13 
      ? "PARABÉNS! Você completou os 14 dias! Celebre sua conquista!"
      : base.summary,
    menu: base.menu,
    motivationalMessage: isSecondWeek ? week2Messages[i - 7] : base.motivationalMessage,
    videoUrl: getVideoUrl(i + 1)
  };
});

export const achievements = [
  {
    id: 'day1',
    name: 'Primeiro Passo',
    description: 'Completou o Dia 1',
    dayRequired: 1,
    icon: '🌱'
  },
  {
    id: 'day7',
    name: 'Uma Semana Forte',
    description: 'Completou 7 dias',
    dayRequired: 7,
    icon: '🏅'
  },
  {
    id: 'day14',
    name: 'Campeã do Desafio',
    description: 'Completou todos os 14 dias',
    dayRequired: 14,
    icon: '🏆'
  }
];
