
Objetivo aprovado: eu fico com os itens 3 e 4 (hardening técnico + critérios de sucesso), e você segue com a limpeza manual de contas.

1) Hardening no `whatsapp-send-reminders` (principal)
- Arquivo: `supabase/functions/whatsapp-send-reminders/index.ts`
- Trocar busca de assinatura:
  - de: `.eq("verified", true).single()`
  - para: `.eq("verified", true).order("updated_at", { ascending: false }).limit(1).maybeSingle()`
- Motivo: evita erro quando há múltiplas assinaturas verificadas do mesmo usuário e escolhe a mais recente.
- Manter normalização para Z-API (`replace(/\D/g, "")`) como está.

2) Revisão dos outros fluxos WhatsApp com risco de duplicidade
- Arquivo: `supabase/functions/whatsapp-webhook/index.ts`
- Ajustar os dois pontos com `.single()` (lookup exato e lookup alternativo com “9”):
  - trocar por `.order("updated_at", { ascending: false }).limit(1).maybeSingle()`
- Resultado: inbound webhook não falha quando houver mais de um registro válido para o mesmo número/formato.

3) Ajuste de logs para diagnóstico real (sem ruído)
- `whatsapp-send-reminders`:
  - diferenciar claramente:
    - “sem assinatura verificada”
    - “assinatura encontrada, mas reminders desabilitado”
    - “envio falhou na Z-API”
  - incluir no retorno JSON contadores por motivo (ex.: `sent`, `skipped_no_subscription`, `skipped_pref_disabled`, `send_errors`).
- Motivo: comprovar rapidamente se o problema é dado, preferência ou integração.

4) Critérios de sucesso (item 4)
- Funcional:
  - a função encontra lembretes no horário BR e envia quando existe assinatura válida.
- Robustez:
  - não ocorre mais falso “No verified WhatsApp” causado por `.single()` com múltiplas linhas.
- Pós-limpeza:
  - você limpa usuários manualmente; eu valido via execução da edge function e logs que não há falhas por duplicidade.
  - (opcional, sem mexer em schema) rodar consultas de auditoria para detectar órfãos nas tabelas por `user_id`.

5) Observação sobre o erro de build enviado
- `dist upload failed ... /bin/aws ... No such file or directory` é falha de infraestrutura de upload do ambiente, não do código dessa correção.
- Não altera o plano técnico dos itens 3 e 4; seguimos com ajustes das edge functions e validação por execução/log.

Detalhes técnicos (resumo)
```text
Padrão seguro para cenários com duplicidade:
.eq(...).order("updated_at", { ascending: false }).limit(1).maybeSingle()

Evita exceção de múltiplas linhas e mantém comportamento determinístico.
```
