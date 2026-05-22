import * as React from "react";
import { ArrowUp, Paperclip, X, StopCircle, Mic, Loader2, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ChatInputBarProps {
  onSend: (text: string, files: File[]) => void | Promise<void>;
  onTextChange?: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  enableAttachments?: boolean;
  enableVoice?: boolean;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  /** When true, mounts as `fixed bottom-0` with safe-area padding. */
  fixedBottom?: boolean;
  /** Extra buttons rendered in the actions row, after the attach button. */
  leadingActions?: React.ReactNode;
}

const VISUALIZER_BARS = 28;

/**
 * Reusable chat input bar in the We Diet (light/pink) theme.
 * - Auto-sizing textarea
 * - Image attachment with preview
 * - Voice recording → transcription (ElevenLabs via `transcribe-audio` edge function)
 * - Pink primary send button; mic switches to send when there is content
 */
export const ChatInputBar = React.forwardRef<HTMLDivElement, ChatInputBarProps>(
  (
    {
      onSend,
      onTextChange,
      placeholder = "Mensagem...",
      isLoading = false,
      enableAttachments = true,
      enableVoice = true,
      disabled = false,
      maxLength = 1000,
      className,
      fixedBottom = false,
      leadingActions,
    },
    ref,
  ) => {
    const [text, _setText] = React.useState("");
    const setText = (val: string | ((prev: string) => string)) => {
      _setText((prev) => {
        const next = typeof val === "function" ? (val as (p: string) => string)(prev) : val;
        onTextChange?.(next);
        return next;
      });
    };
    const [files, setFiles] = React.useState<File[]>([]);
    const [previews, setPreviews] = React.useState<Record<string, string>>({});
    const [isRecording, setIsRecording] = React.useState(false);
    const [isTranscribing, setIsTranscribing] = React.useState(false);
    const [recordingTime, setRecordingTime] = React.useState(0);

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<BlobPart[]>([]);
    const streamRef = React.useRef<MediaStream | null>(null);
    const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
    const cancelRecordingRef = React.useRef(false);

    // Autosize textarea
    React.useEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
    }, [text]);

    const processFile = (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast({ title: "Apenas imagens", variant: "destructive" });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "Imagem muito grande", description: "Máximo 10MB", variant: "destructive" });
        return;
      }
      setFiles([file]);
      const reader = new FileReader();
      reader.onload = (e) => setPreviews({ [file.name]: e.target?.result as string });
      reader.readAsDataURL(file);
    };

    const handleRemoveFile = () => {
      setFiles([]);
      setPreviews({});
    };

    const hasContent = text.trim().length > 0 || files.length > 0;

    const handleSubmit = async () => {
      if (!hasContent || isLoading || disabled) return;
      const t = text.trim();
      const f = files;
      setText("");
      setFiles([]);
      setPreviews({});
      await onSend(t, f);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    // ===== Voice =====
    const cleanupRecording = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      chunksRef.current = [];
      setRecordingTime(0);
    };

    const startRecording = async () => {
      try {
        cancelRecordingRef.current = false;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const isSupported = (type: string) => {
          try {
            return typeof (MediaRecorder as any)?.isTypeSupported === "function"
              ? MediaRecorder.isTypeSupported(type)
              : false;
          } catch {
            return false;
          }
        };
        // iOS Safari/WKWebView only supports audio/mp4 (aac). Try iOS-friendly first.
        const candidates = [
          "audio/mp4",
          "audio/mp4;codecs=mp4a.40.2",
          "audio/aac",
          "audio/webm;codecs=opus",
          "audio/webm",
        ];
        const mime = candidates.find(isSupported) || "";

        let rec: MediaRecorder;
        try {
          rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        } catch (e) {
          cleanupRecording();
          toast({
            title: "Gravação indisponível",
            description: "Seu dispositivo não suporta gravação de áudio aqui.",
            variant: "destructive",
          });
          return;
        }
        mediaRecorderRef.current = rec;
        chunksRef.current = [];
        rec.ondataavailable = (ev) => {
          if (ev.data.size > 0) chunksRef.current.push(ev.data);
        };
        rec.onstop = async () => {
          const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime || "audio/webm" });
          cleanupRecording();
          setIsRecording(false);
          if (cancelRecordingRef.current || blob.size < 1000) return;
          await transcribe(blob);
        };
        rec.start();
        setIsRecording(true);
        setRecordingTime(0);
        timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
      } catch (err) {
        toast({
          title: "Microfone indisponível",
          description: "Permita o acesso ao microfone para gravar.",
          variant: "destructive",
        });
      }
    };

    const stopRecording = (cancel = false) => {
      cancelRecordingRef.current = cancel;
      try {
        mediaRecorderRef.current?.stop();
      } catch {
        cleanupRecording();
        setIsRecording(false);
      }
    };

    const transcribe = async (blob: Blob) => {
      setIsTranscribing(true);
      try {
        const form = new FormData();
        const type = blob.type || "audio/webm";
        const filename = type.includes("mp4") || type.includes("aac") || type.includes("mpeg")
          ? "audio.m4a"
          : "audio.webm";
        form.append("file", blob, filename);
        const { data, error } = await supabase.functions.invoke("transcribe-audio", {
          body: form,
        });
        if (error) throw error;
        const transcribed = (data as { text?: string })?.text?.trim();
        if (transcribed) {
          setText((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
          setTimeout(() => textareaRef.current?.focus(), 0);
        } else {
          toast({ title: "Não entendi", description: "Tente falar novamente.", variant: "destructive" });
        }
      } catch (e: any) {
        toast({
          title: "Erro ao transcrever",
          description: e?.message || "Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsTranscribing(false);
      }
    };

    React.useEffect(() => () => cleanupRecording(), []);

    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    };

    const mainButtonDisabled = disabled || (isLoading && !hasContent);

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-3xl border border-[#FD46A1]/30 bg-white/80 backdrop-blur-md shadow-lg p-2 transition-all",
          isRecording && "border-red-400/70",
          fixedBottom && "fixed bottom-0 left-0 right-0 mx-3 mb-[calc(env(safe-area-inset-bottom)+0.5rem)] z-30",
          className,
        )}
      >
        {/* Attachment preview */}
        {files.length > 0 && !isRecording && (
          <div className="flex flex-wrap gap-2 pb-1">
            {files.map((f) => (
              <div key={f.name} className="relative">
                {previews[f.name] && (
                  <img
                    src={previews[f.name]}
                    alt={f.name}
                    className="w-16 h-16 rounded-xl object-cover border border-[#FD46A1]/30"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-1.5 -right-1.5 bg-[#FD46A1] text-white rounded-full p-0.5 shadow"
                  aria-label="Remover"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea or recording UI */}
        {isRecording ? (
          <div className="flex items-center justify-between gap-2 px-1 py-2">
            <button
              type="button"
              onClick={() => stopRecording(true)}
              className="text-gray-500 p-1.5 rounded-full hover:bg-gray-100"
              aria-label="Cancelar gravação"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 flex-1 justify-center">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-mono text-sm text-gray-700 tabular-nums">
                {formatTime(recordingTime)}
              </span>
              <div className="flex items-center gap-[2px] h-6">
                {Array.from({ length: VISUALIZER_BARS }).map((_, i) => (
                  <motion.span
                    key={i}
                    className="w-[2px] rounded-full bg-[#FD46A1]"
                    animate={{ height: ["20%", "100%", "30%", "80%", "40%"] }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.6,
                      repeat: Infinity,
                      delay: i * 0.04,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, maxLength))}
            onKeyDown={handleKeyDown}
            placeholder={isTranscribing ? "Transcrevendo..." : placeholder}
            rows={1}
            disabled={disabled || isTranscribing}
            className="w-full resize-none bg-transparent px-2 py-2 text-base text-gray-800 placeholder:text-gray-400 outline-none border-0 focus:ring-0 max-h-40"
            style={{ minHeight: "40px" }}
          />
        )}

        {/* Actions row */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1">
            {enableAttachments && !isRecording && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isTranscribing}
                className="h-9 w-9 rounded-full flex items-center justify-center text-[#FD46A1] hover:bg-[#FD46A1]/10 transition disabled:opacity-40"
                aria-label="Anexar imagem"
              >
                <Paperclip className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) processFile(f);
                    if (e.target) e.target.value = "";
                  }}
                />
              </button>
            )}
            {!isRecording && leadingActions}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.button
              key={isRecording ? "stop" : hasContent ? "send" : "mic"}
              type="button"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => {
                if (isLoading) return;
                if (isRecording) {
                  stopRecording(false);
                } else if (hasContent) {
                  handleSubmit();
                } else if (enableVoice) {
                  startRecording();
                }
              }}
              disabled={mainButtonDisabled || isTranscribing}
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center shadow-sm transition disabled:opacity-50",
                isRecording
                  ? "bg-red-500 text-white"
                  : hasContent
                    ? "bg-[#FD46A1] text-white hover:bg-[#FD46A1]/90"
                    : "bg-[#FD46A1]/10 text-[#FD46A1] hover:bg-[#FD46A1]/20",
              )}
              aria-label={
                isRecording ? "Parar gravação" : hasContent ? "Enviar" : "Gravar áudio"
              }
            >
              {isLoading ? (
                <Square className="w-4 h-4 animate-pulse" />
              ) : isTranscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isRecording ? (
                <StopCircle className="w-5 h-5" />
              ) : hasContent ? (
                <ArrowUp className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </motion.button>
          </AnimatePresence>
        </div>
      </div>
    );
  },
);
ChatInputBar.displayName = "ChatInputBar";
