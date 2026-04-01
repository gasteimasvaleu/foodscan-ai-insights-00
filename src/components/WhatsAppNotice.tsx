import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppNoticeProps {
  userId: string;
  className?: string;
}

export const WhatsAppNotice = ({ userId, className }: WhatsAppNoticeProps) => {
  const navigate = useNavigate();
  const [hasVerified, setHasVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('whatsapp_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('verified', true)
        .limit(1)
        .maybeSingle();
      setHasVerified(!!data);
    };
    check();
  }, [userId]);

  if (hasVerified === null || hasVerified) return null;

  return (
    <div className={`flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 ${className || ''}`}>
      <div className="bg-green-500 p-2 rounded-lg shrink-0">
        <MessageCircle className="w-4 h-4 text-white" />
      </div>
      <p className="text-sm text-amber-900 flex-1">
        Habilite o WhatsApp para receber notificações desta página.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 border-amber-300 text-amber-900 hover:bg-amber-100"
        onClick={() => navigate('/whatsapp-settings')}
      >
        Configurar
      </Button>
    </div>
  );
};
