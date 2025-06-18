
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AuthCard = () => {
  const { user, signUp, signIn, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      await signIn(formData.email, formData.password);
    } else {
      await signUp(formData.email, formData.password, formData.name);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="text-center">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (user) {
    const userName = user.user_metadata?.name || user.email;
    return (
      <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-100 rounded-full w-10 h-10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800">
                  Boas-vindas, {userName}!
                </h3>
                <p className="text-sm text-gray-600">Usuário logado</p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl">
      <CardHeader>
        <CardTitle className="text-center text-gray-800">
          {isLogin ? 'Fazer Login' : 'Criar Conta'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                required={!isLogin}
                placeholder="Seu nome"
                className="w-full"
              />
            </div>
          )}
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Login (Email)
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="seu@email.com"
              className="w-full"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              placeholder="Sua senha"
              className="w-full"
              minLength={6}
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white"
          >
            {isLogin ? 'Criar Conta' : 'Fazer Login'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
