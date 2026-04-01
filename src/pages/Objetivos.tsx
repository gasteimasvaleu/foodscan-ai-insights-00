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
    <div className="min-h-screen bg-background pb-24">
      <Navbar />

      <div className="px-4 py-4 space-y-4">
        {/* Header card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FFD1E7] rounded-3xl p-5 shadow-xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Meus Objetivos</h1>
              <p className="text-sm text-muted-foreground">
                Gamifique sua alimentação 🎯
              </p>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="mt-3 bg-white/50 rounded-xl p-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Progresso semanal</span>
              <span className="text-lg font-bold text-primary">
                {completedCount}/{totalCount} ✅
              </span>
            </div>
          )}
        </motion.div>

        {/* Add button */}
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full rounded-xl gap-2"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Adicionar Objetivo
        </Button>

        {/* Objectives list */}
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
