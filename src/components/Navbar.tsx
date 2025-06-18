
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();

  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'FoodScan', href: '/foodscan' },
    { label: 'Controle Diário', href: '/controle-diario' },
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
              <h1 className="text-xl font-bold text-primary-600">FoodScan AI</h1>
            </Link>
          </div>

          {/* Desktop Menu - Hidden on all screens, replaced with hamburger */}
          <div className="hidden">
            {/* Desktop menu removed */}
          </div>

          {/* Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative z-50"
              >
                {isOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 p-0"
            >
              <SheetHeader className="p-6 border-b border-white/20">
                <SheetTitle className="text-white text-lg font-bold">
                  Menu
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-full">
                <div className="p-6 space-y-4">
                  {menuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      className={`block p-4 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm ${
                        isActiveRoute(item.href)
                          ? 'bg-primary-500/20 text-white border border-primary-300/30 shadow-lg'
                          : 'bg-white/20 text-white hover:bg-white/30 hover:text-white border border-white/30'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base text-white">{item.label}</span>
                        {isActiveRoute(item.href) && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
