export interface ExerciseInfo {
  name: string;
  executionTip: string;
}

export interface MuscleGroup {
  label: string;
  exercises: ExerciseInfo[];
}

export const EXERCISE_CATALOG: Record<string, MuscleGroup> = {
  peito: {
    label: "Peito",
    exercises: [
      { name: "Supino reto", executionTip: "Deite no banco, desça a barra até o peito mantendo os cotovelos a 45°. Empurre controladamente até a extensão completa dos braços." },
      { name: "Supino inclinado", executionTip: "Banco a 30-45°, desça a barra até a parte superior do peito. Mantenha as escápulas retraídas durante todo o movimento." },
      { name: "Crucifixo", executionTip: "Deite no banco com halteres, abra os braços em arco mantendo leve flexão nos cotovelos. Junte os halteres acima do peito contraindo o peitoral." },
      { name: "Crossover", executionTip: "Posicione-se entre as polias, incline levemente o tronco. Traga as mãos à frente do corpo em movimento de abraço, contraindo o peitoral." },
      { name: "Flexão de braço", executionTip: "Mãos na largura dos ombros, corpo reto da cabeça aos pés. Desça até o peito quase tocar o chão e empurre de volta." },
      { name: "Supino declinado", executionTip: "Banco declinado a 15-30°, desça a barra até a parte inferior do peito. Foco na contração da porção inferior do peitoral." },
      { name: "Pullover", executionTip: "Deite no banco segurando um halter acima do peito. Leve o peso atrás da cabeça com braços levemente flexionados e retorne." },
    ],
  },
  costas: {
    label: "Costas",
    exercises: [
      { name: "Puxada frontal", executionTip: "Segure a barra com pegada aberta, puxe até a altura do queixo contraindo as escápulas. Controle a volta lentamente." },
      { name: "Remada curvada", executionTip: "Incline o tronco a 45°, costas retas. Puxe a barra até o abdômen inferior, apertando as escápulas no topo." },
      { name: "Remada unilateral", executionTip: "Apoie um joelho e mão no banco, puxe o halter até a cintura. Mantenha o cotovelo próximo ao corpo." },
      { name: "Pulldown", executionTip: "Sentado na máquina, puxe a barra até o peito com pegada fechada ou aberta. Foco na contração dos dorsais." },
      { name: "Remada cavaleiro", executionTip: "Deite de bruços no banco inclinado, puxe os halteres até a cintura. Aperte as escápulas no topo do movimento." },
      { name: "Barra fixa", executionTip: "Segure a barra com pegada pronada, puxe o corpo até o queixo ultrapassar a barra. Desça controladamente." },
      { name: "Remada baixa", executionTip: "Sentado na máquina com cabo, puxe o triângulo até o abdômen. Mantenha o tronco ereto e contraia as costas." },
    ],
  },
  ombros: {
    label: "Ombros",
    exercises: [
      { name: "Desenvolvimento militar", executionTip: "Sentado ou em pé, empurre a barra ou halteres acima da cabeça até a extensão total. Desça até a altura das orelhas." },
      { name: "Elevação lateral", executionTip: "Em pé, eleve os halteres lateralmente até a altura dos ombros com leve flexão nos cotovelos. Controle a descida." },
      { name: "Elevação frontal", executionTip: "Em pé, eleve os halteres à frente até a altura dos ombros, alternando ou simultâneo. Não use impulso do corpo." },
      { name: "Crucifixo inverso", executionTip: "Incline o tronco ou use a máquina, abra os braços para trás contraindo o deltóide posterior. Controle o retorno." },
      { name: "Arnold press", executionTip: "Inicie com halteres na frente do rosto (pegada supinada), gire e empurre acima da cabeça. Inverta o movimento na descida." },
      { name: "Encolhimento", executionTip: "Segure halteres ou barra ao lado do corpo, eleve os ombros em direção às orelhas. Segure no topo e desça lentamente." },
    ],
  },
  biceps: {
    label: "Bíceps",
    exercises: [
      { name: "Rosca direta", executionTip: "Em pé, segure a barra com pegada supinada. Flexione os cotovelos trazendo a barra até os ombros sem mover os cotovelos." },
      { name: "Rosca alternada", executionTip: "Em pé com halteres, flexione um braço de cada vez até o ombro. Mantenha o cotovelo fixo ao lado do corpo." },
      { name: "Rosca martelo", executionTip: "Segure os halteres com pegada neutra (palmas voltadas uma para outra). Flexione até o ombro, trabalhando bíceps e braquial." },
      { name: "Rosca concentrada", executionTip: "Sentado, apoie o cotovelo na parte interna da coxa. Flexione o halter até o ombro com máxima contração do bíceps." },
      { name: "Rosca Scott", executionTip: "Apoie os braços no banco Scott, flexione a barra até o topo. Desça lentamente sem estender completamente os cotovelos." },
      { name: "Rosca inversa", executionTip: "Segure a barra com pegada pronada (palmas para baixo). Flexione até os ombros, trabalhando braquiorradial e antebraço." },
    ],
  },
  triceps: {
    label: "Tríceps",
    exercises: [
      { name: "Tríceps pulley", executionTip: "Em pé na polia alta, empurre a barra para baixo estendendo os cotovelos. Mantenha os cotovelos fixos ao lado do corpo." },
      { name: "Tríceps testa", executionTip: "Deite no banco, segure a barra com braços estendidos. Flexione os cotovelos levando a barra até a testa e estenda de volta." },
      { name: "Tríceps francês", executionTip: "Sentado ou em pé, segure um halter atrás da cabeça. Estenda os braços acima da cabeça mantendo os cotovelos apontados para cima." },
      { name: "Mergulho", executionTip: "Nas barras paralelas, desça flexionando os cotovelos até 90°. Empurre de volta à posição inicial mantendo o tronco levemente inclinado." },
      { name: "Tríceps coice", executionTip: "Incline o tronco, cotovelo a 90° ao lado do corpo. Estenda o antebraço para trás contraindo o tríceps no final." },
      { name: "Tríceps corda", executionTip: "Na polia alta com corda, empurre para baixo e abra as mãos no final do movimento. Aperte o tríceps na extensão total." },
    ],
  },
  quadriceps: {
    label: "Pernas (Quadríceps)",
    exercises: [
      { name: "Agachamento livre", executionTip: "Barra nas costas, pés na largura dos ombros. Desça até as coxas ficarem paralelas ao chão, mantendo os joelhos alinhados com os pés." },
      { name: "Leg press", executionTip: "Posicione os pés na plataforma na largura dos ombros. Flexione os joelhos a 90° e empurre de volta sem travar os joelhos." },
      { name: "Cadeira extensora", executionTip: "Sentado na máquina, estenda as pernas até a extensão completa. Contraia o quadríceps no topo e desça lentamente." },
      { name: "Agachamento hack", executionTip: "Costas apoiadas na máquina, pés à frente. Desça flexionando os joelhos e empurre de volta mantendo as costas apoiadas." },
      { name: "Agachamento búlgaro", executionTip: "Um pé no banco atrás, desça flexionando o joelho da frente até 90°. Mantenha o tronco ereto e empurre de volta." },
      { name: "Passada", executionTip: "Dê um passo à frente, flexione ambos os joelhos a 90°. Empurre de volta à posição inicial alternando as pernas." },
    ],
  },
  posterior: {
    label: "Pernas (Posterior)",
    exercises: [
      { name: "Cadeira flexora", executionTip: "Deite de bruços na máquina, flexione os joelhos trazendo os calcanhares em direção aos glúteos. Desça controladamente." },
      { name: "Stiff", executionTip: "Em pé com barra ou halteres, incline o tronco para frente com pernas quase estendidas. Sinta o alongamento nos posteriores e suba." },
      { name: "Mesa flexora", executionTip: "Sentado na máquina, flexione os joelhos empurrando a almofada para baixo. Contraia os posteriores e retorne lentamente." },
      { name: "Levantamento terra romeno", executionTip: "Similar ao stiff, mas com leve flexão nos joelhos. Desça a barra até a canela mantendo as costas retas." },
      { name: "Good morning", executionTip: "Barra nas costas, incline o tronco para frente mantendo as costas retas e joelhos levemente flexionados. Retorne contraindo posteriores e glúteos." },
    ],
  },
  gluteos: {
    label: "Glúteos",
    exercises: [
      { name: "Hip thrust", executionTip: "Costas apoiadas no banco, barra sobre o quadril. Eleve o quadril até a extensão total contraindo os glúteos no topo." },
      { name: "Elevação pélvica", executionTip: "Deite no chão, pés apoiados, eleve o quadril contraindo os glúteos. Segure no topo por 2 segundos." },
      { name: "Abdução de quadril", executionTip: "Na máquina ou com elástico, abra as pernas para fora contra a resistência. Contraia o glúteo médio e retorne lentamente." },
      { name: "Kickback", executionTip: "De quatro ou na máquina, estenda uma perna para trás e para cima. Contraia o glúteo no topo do movimento." },
      { name: "Agachamento sumô", executionTip: "Pés bem afastados e apontados para fora, desça mantendo o tronco ereto. Empurre pelos calcanhares contraindo glúteos." },
    ],
  },
  panturrilha: {
    label: "Panturrilha",
    exercises: [
      { name: "Panturrilha em pé", executionTip: "Na máquina ou com barra, eleve os calcanhares o máximo possível. Desça lentamente até sentir o alongamento completo." },
      { name: "Panturrilha sentado", executionTip: "Sentado na máquina, eleve os calcanhares contraindo a panturrilha. Foco no sóleo com esta variação." },
      { name: "Panturrilha no leg press", executionTip: "Posicione apenas a ponta dos pés na plataforma do leg press. Empurre estendendo os tornozelos e retorne." },
      { name: "Panturrilha unilateral", executionTip: "Em pé em um degrau, apoie-se em uma perna. Eleve o calcanhar ao máximo e desça abaixo do nível do degrau." },
    ],
  },
  abdomen: {
    label: "Abdômen",
    exercises: [
      { name: "Abdominal crunch", executionTip: "Deite com joelhos flexionados, mãos atrás da cabeça. Eleve os ombros do chão contraindo o abdômen, sem puxar o pescoço." },
      { name: "Prancha", executionTip: "Apoie-se nos antebraços e pontas dos pés, corpo reto. Mantenha o abdômen contraído pelo tempo determinado." },
      { name: "Elevação de pernas", executionTip: "Deite ou pendure-se na barra, eleve as pernas retas até 90°. Desça lentamente sem tocar o chão." },
      { name: "Abdominal oblíquo", executionTip: "Deite com joelhos flexionados, leve o cotovelo em direção ao joelho oposto. Alterne os lados com controle." },
      { name: "Roda abdominal", executionTip: "Ajoelhado, role a roda para frente estendendo o corpo. Retorne à posição inicial usando a força do abdômen." },
      { name: "Mountain climber", executionTip: "Em posição de prancha alta, traga alternadamente os joelhos ao peito em movimento rápido e controlado." },
    ],
  },
  antebraco: {
    label: "Antebraço",
    exercises: [
      { name: "Rosca de punho", executionTip: "Antebraços apoiados no banco, palmas para cima. Flexione os punhos levantando a barra e desça lentamente." },
      { name: "Rosca inversa de punho", executionTip: "Antebraços apoiados, palmas para baixo. Estenda os punhos levantando a barra, fortalecendo os extensores." },
      { name: "Farmer walk", executionTip: "Segure halteres pesados ao lado do corpo e caminhe mantendo postura ereta. Fortalece antebraços, core e trapézio." },
    ],
  },
};
