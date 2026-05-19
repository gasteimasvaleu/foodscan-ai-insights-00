import { useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";

interface Props {
  photoUrl?: string | null;
  categoryEmoji?: string;
  name?: string;
  uploading?: boolean;
  onPickFile: (file: File) => void;
  onRemove?: () => void;
}

export function VenuePhotoHeader({
  photoUrl,
  categoryEmoji,
  name,
  uploading,
  onPickFile,
  onRemove,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const initial = name?.trim()?.[0]?.toUpperCase();

  return (
    <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPickFile(f);
        }}
      />

      <div className="relative h-32 bg-gradient-to-br from-[#FD46A1] to-[#FFD1E7]">
        {photoUrl && (
          <img
            src={photoUrl}
            alt={name ?? "Foto do venue"}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {photoUrl && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-3 right-3 bg-[#FD46A1] text-white rounded-full p-2 shadow-md"
            aria-label="Remover foto"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-end justify-between gap-3 -mt-16 relative z-10">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-[#FFD1E7] border-4 border-white flex items-center justify-center text-5xl shadow-md overflow-hidden">
              {photoUrl ? (
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                categoryEmoji ?? initial ?? "📍"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 right-1 bg-[#FD46A1] text-white rounded-full p-2 shadow-md disabled:opacity-60"
              aria-label="Alterar foto"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Toque na câmera para {photoUrl ? "trocar" : "enviar"} a foto. JPG ou PNG, até 5 MB.
        </p>
      </div>
    </div>
  );
}
