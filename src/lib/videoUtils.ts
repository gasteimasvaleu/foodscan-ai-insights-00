// Helpers for client-side short-video uploads (community feed & stories)

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
}

export function getVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    (video as any).playsInline = true;
    video.src = url;
    video.onloadedmetadata = () => {
      const meta = {
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      };
      URL.revokeObjectURL(url);
      resolve(meta);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível ler o vídeo. Tente outro arquivo."));
    };
  });
}

export function extractFirstFrame(file: File, maxDim = 720, quality = 0.82): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    (video as any).playsInline = true;
    video.src = url;

    const cleanup = () => URL.revokeObjectURL(url);

    video.onloadeddata = () => {
      // Seek slightly past 0 to ensure a frame is decoded
      try {
        video.currentTime = Math.min(0.1, (video.duration || 1) / 2);
      } catch {
        /* noop */
      }
    };

    video.onseeked = () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) throw new Error("Vídeo sem dimensões");
        const scale = Math.min(1, maxDim / Math.max(w, h));
        const cw = Math.round(w * scale);
        const ch = Math.round(h * scale);
        const canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas indisponível");
        ctx.drawImage(video, 0, 0, cw, ch);
        canvas.toBlob(
          (blob) => {
            cleanup();
            if (blob) resolve(blob);
            else reject(new Error("Falha ao gerar capa do vídeo"));
          },
          "image/jpeg",
          quality
        );
      } catch (e) {
        cleanup();
        reject(e instanceof Error ? e : new Error("Erro ao gerar capa"));
      }
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Não foi possível processar o vídeo."));
    };
  });
}

export function validateVideo(
  file: File,
  opts: { maxSeconds: number; maxMB: number },
  meta: VideoMetadata
) {
  const maxBytes = opts.maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error(`Vídeo muito grande: máximo ${opts.maxMB} MB.`);
  }
  if (meta.duration > opts.maxSeconds + 0.5) {
    throw new Error(
      `Vídeo muito longo: ${Math.round(meta.duration)}s. Máximo ${opts.maxSeconds}s.`
    );
  }
}

export function videoExtensionFromMime(mime: string): string {
  if (mime.includes("quicktime")) return "mov";
  if (mime.includes("webm")) return "webm";
  return "mp4";
}
