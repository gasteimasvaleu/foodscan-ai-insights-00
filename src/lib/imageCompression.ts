/**
 * Comprime uma imagem (File ou base64 com prefixo) e retorna base64 SEM o prefixo data:.
 */
export async function compressImage(
  input: File | string,
  maxWidth = 1200,
  quality = 0.85
): Promise<string> {
  const dataUrl = typeof input === 'string'
    ? (input.startsWith('data:') ? input : `data:image/jpeg;base64,${input}`)
    : await fileToDataUrl(input);

  const img = await loadImage(dataUrl);

  const ratio = Math.min(1, maxWidth / img.width);
  const targetW = Math.round(img.width * ratio);
  const targetH = Math.round(img.height * ratio);

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Falha ao obter contexto canvas');
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const compressed = canvas.toDataURL('image/jpeg', quality);
  return compressed.split(',')[1] ?? compressed;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = src;
  });
}
