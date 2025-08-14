import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface ApiKeyFormProps {
  onApiKeyUpdated?: () => void;
}

export const ApiKeyForm: React.FC<ApiKeyFormProps> = ({ onApiKeyUpdated }) => {
  const handleApiKeyUpdate = () => {
    toast({
      title: "API Key atualizada!",
      description: "A chave OpenAI foi configurada com sucesso no Supabase.",
    });
    onApiKeyUpdated?.();
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Configurar API Key OpenAI</CardTitle>
        <CardDescription>
          Configure sua chave da OpenAI de forma segura no Supabase
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Clique no botão abaixo para configurar sua API key da OpenAI de forma segura:
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-700 mb-2">
            Para configurar a API Key, acesse o painel do Supabase e adicione a variável <code>OPENAI_API_KEY</code> nas configurações de secrets.
          </p>
          <p className="text-xs text-blue-600">
            Após configurar, todas as funções passarão a usar a nova chave automaticamente.
          </p>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          <p>✅ Totalmente seguro - a chave fica protegida no Supabase</p>
          <p>✅ Usado por todas as Edge Functions automaticamente</p>
          <p>✅ Nunca exposta no frontend</p>
        </div>
      </CardContent>
    </Card>
  );
};