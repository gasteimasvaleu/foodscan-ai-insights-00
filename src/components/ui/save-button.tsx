"use client"

import { useState } from "react"
import { Loader2, Check, Sparkles } from "lucide-react"
import confetti from "canvas-confetti"
import { cn } from "@/lib/utils"

interface SaveButtonProps {
  text?: {
    idle?: string
    saving?: string
    saved?: string
  }
  className?: string
  onSave?: () => Promise<void> | void
}

export function SaveButton({ 
  text = {
    idle: "Save",
    saving: "Saving...",
    saved: "Saved!"
  },
  className,
  onSave
}: SaveButtonProps) {
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [bounce, setBounce] = useState(false)

  const handleSave = async () => {
    if (status === "idle") {
      setStatus("saving")
      try {
        if (onSave) {
          await onSave()
        } else {
          // Simulação de salvamento se onSave não for fornecido
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
        setStatus("saved")
        setBounce(true)
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff"],
          shapes: ["star", "circle"],
        })
        setTimeout(() => {
          setStatus("idle")
          setBounce(false)
        }, 2000)
      } catch (error) {
        setStatus("idle")
        console.error("Save failed:", error)
      }
    }
  }

  const getButtonClasses = () => {
    const baseClasses = "relative overflow-hidden rounded-xl px-6 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
    
    switch (status) {
      case "saving":
        return cn(baseClasses, "bg-blue-500 text-white", className)
      case "saved":
        return cn(baseClasses, "bg-green-500 text-white", className)
      default:
        return cn(baseClasses, "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600", className)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className={getButtonClasses()}
        style={{ minWidth: "150px" }}
      >
        <span className="flex items-center justify-center gap-2 text-sm font-medium">
          {status === "saving" && (
            <span className="animate-spin">
              <Loader2 className="w-4 h-4" />
            </span>
          )}
          {status === "saved" && (
            <span className="text-white">
              <Check className="w-4 h-4" />
            </span>
          )}
          <span className="transition-all duration-300">
            {status === "idle" ? text.idle : status === "saving" ? text.saving : text.saved}
          </span>
        </span>
      </button>
      {bounce && (
        <div className="absolute top-0 right-0 -mr-1 -mt-1 animate-bounce">
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
      )}
    </div>
  )
}