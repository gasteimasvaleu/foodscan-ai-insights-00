import { Capacitor } from "@capacitor/core";

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.warn("clipboard api failed", e);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch {
    return false;
  }
}

export async function downloadImage(url: string, filename = "post.png") {
  // Native: salva no Photos
  if (Capacitor.isNativePlatform()) {
    try {
      const { Filesystem, Directory } = await import("@capacitor/filesystem");
      const { Share } = await import("@capacitor/share");
      const resp = await fetch(url);
      const blob = await resp.blob();
      const base64 = await blobToBase64(blob);
      const writeRes = await Filesystem.writeFile({
        path: filename,
        data: base64,
        directory: Directory.Cache,
      });
      await Share.share({
        title: "Post Instagram",
        url: writeRes.uri,
        dialogTitle: "Salvar imagem",
      });
      return;
    } catch (e) {
      console.warn("native download failed, falling back", e);
    }
  }
  // Web
  try {
    const resp = await fetch(url, { mode: "cors" });
    const blob = await resp.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
  } catch (e) {
    console.error("download failed", e);
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => {
      const s = String(r.result || "");
      resolve(s.split(",")[1] || "");
    };
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

export async function shareNative(text: string, url?: string) {
  try {
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import("@capacitor/share");
      await Share.share({ text, url, dialogTitle: "Compartilhar post" });
      return true;
    }
    if (navigator.share) {
      await navigator.share({ text, url });
      return true;
    }
  } catch (e) {
    console.warn("share failed", e);
  }
  return false;
}
