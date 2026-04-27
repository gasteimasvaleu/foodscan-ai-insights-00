import { Capacitor } from "@capacitor/core";

/**
 * Abre uma URL externa fora do app.
 * - Web: nova aba do navegador.
 * - iOS/Android nativo (Capacitor): usa @capacitor/browser para abrir
 *   no navegador in-app do sistema, garantindo que a navegação NÃO
 *   aconteça dentro do WebView do app.
 */
export async function openExternalUrl(url: string) {
  if (!url) return;
  try {
    if (Capacitor.isNativePlatform()) {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url });
      return;
    }
  } catch (err) {
    console.warn("[openExternalUrl] Falha ao abrir nativamente, fallback web:", err);
  }
  window.open(url, "_blank", "noopener,noreferrer");
}
