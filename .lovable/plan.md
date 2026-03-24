

# Corrigir App ID do Capacitor

## Alteração

Atualizar `capacitor.config.ts`: mudar o `appId` de `app.lovable.7af51b51f57a4397be1bb371107e8a01` para `app.dietainteligente` e o `appName` para `We Diet`.

Isso resolve o erro do terminal porque o novo ID segue o formato Java package exigido pelo Capacitor (sem traços, sem segmentos começando com número).

## Detalhe técnico

| Campo | Antes | Depois |
|---|---|---|
| `appId` | `app.lovable.7af51b51f57a4397be1bb371107e8a01` | `app.dietainteligente` |
| `appName` | `We Diet` | `We Diet` (sem mudança) |

