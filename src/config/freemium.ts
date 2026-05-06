/**
 * Feature flag global do plano Freemium iOS.
 *
 * Princípio de segurança:
 * - Se algo der errado em produção, troque `FREEMIUM_ENABLED` para `false`
 *   e suba um Live Update via Appflow (~5 min para propagar).
 * - O app volta ao comportamento anterior (paywall full-screen) sem precisar
 *   passar pela revisão da Apple.
 *
 * Salvaguarda crítica: toda checagem de gating deve começar com
 * `if (subscribed) → liberado`. Os assinantes pagos nunca são bloqueados.
 */
export const FREEMIUM_ENABLED = true;

/** Quota diária de análises gratuitas no FoodScan (free + iOS nativo). */
export const FOODSCAN_DAILY_LIMIT = 3;
