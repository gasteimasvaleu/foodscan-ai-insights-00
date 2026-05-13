import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CelebrationOverlay } from "@/components/celebration/CelebrationOverlay";

export type CelebrationPayload = {
  type: "badge" | "streak";
  icon: string;
  title: string;
  description: string;
};

type Ctx = {
  triggerCelebration: (p: CelebrationPayload) => void;
};

const CelebrationContext = createContext<Ctx | null>(null);

export function CelebrationProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<CelebrationPayload[]>([]);
  const [current, setCurrent] = useState<CelebrationPayload | null>(null);

  const triggerCelebration = useCallback((p: CelebrationPayload) => {
    setQueue((q) => [...q, p]);
  }, []);

  useEffect(() => {
    if (!current && queue.length > 0) {
      setCurrent(queue[0]);
      setQueue((q) => q.slice(1));
    }
  }, [queue, current]);

  return (
    <CelebrationContext.Provider value={{ triggerCelebration }}>
      {children}
      {current && (
        <CelebrationOverlay
          payload={current}
          onClose={() => setCurrent(null)}
        />
      )}
    </CelebrationContext.Provider>
  );
}

export function useCelebration() {
  const ctx = useContext(CelebrationContext);
  if (!ctx) {
    return { triggerCelebration: () => {} };
  }
  return ctx;
}
