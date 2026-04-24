import React, { useRef } from "react";
import { Upload, X, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TryOnUploadProps {
  label: string;
  hint?: string;
  previewUrl: string | null;
  onFileSelected: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
}

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

const TryOnUpload: React.FC<TryOnUploadProps> = ({
  label,
  hint,
  previewUrl,
  onFileSelected,
  onClear,
  disabled,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      alert("Formato inválido. Use JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      alert("Arquivo muito grande. Máximo 8 MB.");
      return;
    }
    onFileSelected(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium text-foreground px-1">{label}</p>

      <div
        className={cn(
          "relative w-full aspect-[3/4] rounded-3xl overflow-hidden border-2 border-dashed border-[#FA1690]/30 bg-[#FFD1E7]/40 flex items-center justify-center",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onClear}
              aria-label="Remover imagem"
              className="absolute top-2 right-2 w-9 h-9 rounded-full bg-[#FD46A1] text-white flex items-center justify-center shadow-lg active:scale-95"
            >
              <X size={18} />
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md text-sm font-semibold text-foreground shadow"
            >
              Trocar
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex flex-col items-center gap-3 text-[#FD46A1] px-6 py-8"
          >
            <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow">
              <ImagePlus size={26} />
            </div>
            <span className="text-sm font-semibold">Enviar foto</span>
            {hint && (
              <span className="text-xs text-muted-foreground text-center max-w-[180px]">
                {hint}
              </span>
            )}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default TryOnUpload;
