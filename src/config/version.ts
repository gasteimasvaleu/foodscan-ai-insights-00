/** Native version shown in Profile. Keep in sync with MARKETING_VERSION (CURRENT_PROJECT_VERSION). */
export const APP_VERSION = '1.1.0 (24)';

/** Web bundle build time; changes on every Live Update. */
export const APP_BUILD_LABEL = (() => {
  try {
    const d = new Date(__APP_BUILD__);
    return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  } catch {
    return '';
  }
})();
