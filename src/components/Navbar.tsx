
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

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
    return location.pathname === href;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-primary-600">FoodScan & Diet</h1>
            </Link>
          </div>

          {/* Menu Button */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">MENU</span>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="container mx-auto px-4 py-4">
              <div className="space-y-2">
                {menuItems.map(item => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className={`block p-3 rounded-lg transition-all duration-200 font-medium ${
                      isActiveRoute(item.href)
                        ? 'bg-primary-500/20 text-primary-600 border border-primary-300/30'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {isActiveRoute(item.href) && (
                        <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
