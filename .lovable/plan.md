# Corrigir seletores de data na página /maternidade (iOS nativo)

## Problema

No iOS nativo (WKWebView do Capacitor), `<input type="date">` e `<input type="datetime-local">` não abrem o picker nativo de forma confiável e renderizam o valor centralizado/quebrado, como no screenshot da Calculadora de DPP.

## Solução

Criar um componente reutilizável **`MatDatePicker`** (Popover + Calendar do shadcn, padrão de design system já documentado no projeto) e substituir todos os `<Input type="date">` da pasta `src/components/maternidade`. Para campos `type="datetime-local"`, dividir em **DatePicker + Input de hora** (`type="time"`), que funciona bem no iOS.

## Arquivos a alterar

**Novo componente**
- `src/components/maternidade/MatDatePicker.tsx` — wrapper Popover + Calendar (locale pt-BR), trigger no estilo glassmorphism (`bg-white/70 backdrop-blur-md`, `h-12 rounded-xl`), exibe `dd 'de' MMM 'de' yyyy` ou placeholder. Aceita `value: string (YYYY-MM-DD)` e `onChange(v: string)` para manter compatível com o storage atual.

**Substituições `type="date"`**
- `src/components/maternidade/gestacao/DueDateCalculator.tsx` (linha 47) — DPP
- `src/components/maternidade/tentantes/CycleTracker.tsx` (linha 194)
- `src/components/maternidade/tentantes/FertilityCalculator.tsx` (linha 56)
- `src/components/maternidade/bebe/BabyProfileCard.tsx` (linha 128) — data de nascimento do bebê
- `src/components/maternidade/bebe/GrowthSleep.tsx` (linha 167)
- `src/components/maternidade/bebe/sleep/GrowthCard.tsx` (linha 92)

**Substituições `type="datetime-local"` (dividir em data + hora)**
- `src/components/maternidade/bebe/sleep/SleepDiaryAdvanced.tsx` (linhas 191 e 195)
- `src/components/maternidade/bebe/GrowthSleep.tsx` (linhas 197 e 201)

Para esses, criar helpers `splitDateTime(iso)` → `{date, time}` e `joinDateTime(date, time)` → `YYYY-MM-DDTHH:mm`, mantendo o mesmo formato salvo no Supabase.

## Detalhes técnicos

- Reusar `Calendar` (`@/components/ui/calendar`) com `mode="single"`, `locale={ptBR}` e `className="p-3 pointer-events-auto"` (necessário dentro de Dialog/Drawer).
- Usar `format`/`parseISO` de `date-fns` para converter entre `Date` e a string `YYYY-MM-DD` que já é persistida.
- Nenhuma mudança de schema, lógica de negócio ou backend. Apenas presentation.
- Mantém os tokens de design já em uso (`#FD46A1`, glassmorphism, `text-base`, `h-12 rounded-xl`).
- Inputs `type="time"` permanecem (já funcionam no iOS com `appearance-none text-left`, conforme memória do projeto).

Posso implementar?
