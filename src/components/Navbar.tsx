
import { useState } from 'react';
import { X, LogOut } from 'lucide-react';

import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';


export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const location = useLocation();
  const { user, signOut } = useAuth();


  if (!user) return null;

  const menuItems = [
    { label: 'Meu Perfil', href: '/profile' },
    { label: 'Política de Privacidade', href: '/politica-de-privacidade' },
    { label: 'Termos de Uso', href: '/termos-de-uso' },
    { label: 'Widget iOS', href: '/widget-guide' },
    { label: 'Sobre', href: '/sobre' }
  ];

  const isActiveRoute = (href: string) => {
    return location.pathname === href;
  };

  const handleLogout = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FA1690]/85 backdrop-blur-md border-b border-white/20 shadow-sm pt-[calc(env(safe-area-inset-top)*0.6)]" style={{ WebkitTransform: 'translateZ(0)', willChange: 'transform' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img src="https://zyhmwcsfifdepqnnrguo.supabase.co/storage/v1/object/public/criativos/wedietlogonavbar4.png" alt="We Diet" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Desktop Menu - Hidden on all screens, replaced with hamburger */}
          <div className="hidden">
            {/* Desktop menu removed */}
          </div>

          {/* Profile Trigger - unified single tap target */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Abrir menu do perfil"
                className="relative z-50 flex items-center gap-2 min-w-[48px] min-h-[48px] p-2 rounded-xl text-white/90 hover:text-white hover:bg-white/10 active:scale-95 transition-all duration-150"
              >
                <span className="text-sm font-medium">MEU PERFIL</span>
                <span className="w-8 h-8 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-sm font-semibold text-white">
                  {isOpen ? (
                    <X className="h-4 w-4" />
                  ) : (
                    ((user.user_metadata?.name as string | undefined) || user.email || '?')
                      .trim()
                      .charAt(0)
                      .toUpperCase()
                  )}
                </span>
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/10 backdrop-blur-xl border-2 border-primary rounded-2xl p-0 flex flex-col h-[calc(100%-3rem)] my-6">
              <SheetHeader className="p-6 border-b border-white/20 flex-shrink-0">
                <SheetTitle className="text-white text-lg font-bold">
                  Meu Perfil
                </SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="flex-1">
                <div className="p-6 space-y-4 pb-8">
                  {menuItems.map(item => (
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
                  
                  {/* Logout Button - Only show if user is logged in */}
                  {user && (
                    <button
                      onClick={handleLogout}
                      className="w-full p-4 rounded-xl transition-all duration-200 font-medium backdrop-blur-sm bg-red-500/20 text-white hover:bg-red-500/30 border border-red-300/30 shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-base text-white">Sair</span>
                        <LogOut className="w-4 h-4 text-white" />
                      </div>
                    </button>
                  )}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};
