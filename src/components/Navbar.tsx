import React, { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleLink } from '@/components/SimpleLink';
import { useRouter } from '@/hooks/useRouter';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentPath } = useRouter();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'FoodScan', href: '/foodscan' },
    { label: 'Controle Diário', href: '/controle-diario' },
    { label: 'MasterCheFIT', href: '/masterchef' },
    { label: 'ServiNUTRI', href: '/servinutri' },
    { label: 'Quero Assinar', href: '/quero-assinar' },
    { label: 'Sobre', href: '/sobre' }
  ];

  const isActiveRoute = (href: string) => {
    return currentPath === href;
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <SimpleLink to="/">
              <h1 className="text-xl font-bold text-primary-600">FoodScan & Diet</h1>
            </SimpleLink>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2">
            <span 
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors cursor-pointer"
              onClick={() => setIsOpen(!isOpen)}
            >
              MENU
            </span>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="flex flex-col space-y-2">
                {menuItems.map(item => (
                  <SimpleLink
                    key={item.label}
                    to={item.href}
                    className={`block px-4 py-3 rounded-lg transition-all duration-200 font-medium ${
                      isActiveRoute(item.href)
                        ? 'bg-primary-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </SimpleLink>
                ))}
                
                {/* Logout Button - Only show if user is logged in */}
                {user && (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 font-medium text-red-600 hover:bg-red-50"
                  >
                    <span>Sair</span>
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};