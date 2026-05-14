## Card a melhorar

Header de boas-vindas do onboarding em `/desafio-14-dias` (linhas 137-142 de `src/pages/Desafio14Dias.tsx`):

- bg `#FFD1E7` rounded-3xl simples
- `<h1>` "Desafio 14 dias"
- `<p>` "Uma jornada de 14 dias com cardápio, vídeos e checklist diário para você se transformar."

Hoje é só um retângulo rosa estático — pouca personalidade, zero hierarquia visual, sem reforço da promessa.

## Direção proposta — "Hero glow"

Transformar em um hero card premium com sensação de jornada, mantendo paleta We Diet (#FD46A1 / #FFD1E7 / branco):

1. **Fundo em camadas**
   - Card `rounded-[32px]` com gradiente diagonal `from-[#FD46A1] via-[#FF7AB8] to-[#FFB3D5]`
   - Glow rosa difuso atrás do card (`absolute -inset-2 bg-[#FD46A1]/30 blur-2xl rounded-[40px] -z-10`)
   - Padrão decorativo: 2 círculos brancos translúcidos posicionados em cantos opostos (`bg-white/10`, `blur-xl`)
   - Ruído sutil opcional: emoji 🔥 / ✨ flutuante no canto

2. **Selo de identidade**
   - Pill no topo: `bg-white/20 backdrop-blur-sm` com ícone `Sparkles` + texto `"DESAFIO EXCLUSIVO"` (text-[10px] tracking-widest uppercase text-white)

3. **Hierarquia tipográfica**
   - Eyebrow: "14 dias para uma nova versão" (text-xs text-white/80)
   - Título: `text-[34px] leading-[1.05] font-black text-white` — quebra "Desafio" / "14 dias" em 2 linhas, com "14" em destaque ainda maior (`text-5xl`) ou em peso/cor alternativa
   - Subtítulo: 2 linhas curtas e diretas separadas — "Cardápio guiado, vídeos diários e checklist." e "Comece hoje, transforme em 2 semanas."

4. **Mini-stats row na base do card**
   - 3 colunas com ícone + número + label: `🍽 14 cardápios` · `▶ 14 vídeos` · `✅ checklist diário`
   - Separadores verticais brancos translúcidos
   - Reforça valor concreto da promessa

5. **Animação leve (Framer Motion)**
   - Fade + slide-up no mount (`initial={{opacity:0, y:16}} animate={{opacity:1, y:0}}`)
   - Glow pulsando suave (`animate={{opacity:[0.3,0.5,0.3]}} transition={{duration:3, repeat:Infinity}}`)
   - Ícone Sparkles com shimmer rotation

## Consistência

- Continua usando paleta We Diet (#FD46A1, #FFD1E7, branco)
- Mantém `rounded-3xl` family / glassmorphism característicos do app
- Card fica visualmente consistente com cards "premium" já existentes (Quick Actions hero, AuthCard)

## Implementação

Editar **apenas** o bloco do header de boas-vindas (linhas 136-142 de `src/pages/Desafio14Dias.tsx`). Nenhuma outra mudança em outros arquivos. Sem nova dependência (Framer Motion já está no projeto).
