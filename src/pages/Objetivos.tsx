import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useObjectives, ObjectiveKey } from '@/hooks/useObjectives';
import { ObjectiveCard } from '@/components/ObjectiveCard';
import { AddObjectiveModal } from '@/components/AddObjectiveModal';
import { AuthCard } from '@/components/AuthCard';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '@/hooks/use-toast';
import { WhatsAppNotice } from '@/components/WhatsAppNotice';

const Objetivos = () => {
  const { user, loading: authLoading } = useAuth();
  const { progress, loading, addObjective, removeObjective, objectives } = useObjectives();
  const [modalOpen, setModalOpen] = useState(false);

  if (authLoading) return null;
  if (!user) return <AuthCard />;

  const completedCount = progress.filter(p => p.isWithinGoal).length;
  const totalCount = progress.length;

  const handleRemove = async (id: string) => {
    await removeObjective(id);
    toast({ title: 'Objetivo removido' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* Fixed top section */}
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+4rem)] space-y-4 flex-shrink-0">
        {/* Header card */}
        <div className="bg-gradient-to-r from-primary/20 via-primary/25 to-primary/30 backdrop-blur-xl border border-white/30 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary to-accent p-2.5 rounded-xl shadow-lg">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-lg font-bold text-primary">Meus Objetivos</h1>
        </div>

        <WhatsAppNotice userId={user.id} />

        {totalCount > 0 && (
          <div className="bg-white/50 rounded-xl p-3 flex items-center justify-between shadow">
            <span className="text-sm font-semibold text-foreground">Progresso semanal</span>
            <span className="text-lg font-bold text-primary">
              {completedCount}/{totalCount} ✅
            </span>
          </div>
        )}

        {/* Add button */}
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-xl gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Adicionar Objetivo
        </Button>
      </div>

      {/* Scrollable objectives list */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : progress.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 space-y-3"
          >
            <Target className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <p className="text-muted-foreground">Nenhum objetivo configurado</p>
            <p className="text-sm text-muted-foreground">
              Toque em "Adicionar Objetivo" para começar a monitorar suas metas!
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {progress.map((p) => (
                <ObjectiveCard key={p.objective.id} data={p} onRemove={handleRemove} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AddObjectiveModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onAdd={addObjective}
        existingKeys={objectives.map(o => o.objective_key)}
      />
    </div>
  );
};

export default Objetivos;
