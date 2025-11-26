
import { useState } from 'react';
import { User, X, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'react-router-dom';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const menuItems = [
    { label: 'Meu Perfil', href: '/profile' },
    { label: 'Quero Assinar', href: '/quero-assinar' },
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-xl font-bold text-primary-600">FoodScan & Diet</h1>
            </Link>
          </div>

          {/* Desktop Menu - Hidden on all screens, replaced with hamburger */}
          <div className="hidden">
            {/* Desktop menu removed */}
          </div>

          {/* Hamburger Menu with MENU text */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <div className="flex items-center space-x-2 cursor-pointer">
                <span 
                  className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsOpen(true)}
                >
                  MEU PERFIL
                </span>
                <Button variant="ghost" size="icon" className="relative z-50">
                  {isOpen ? <X className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </Button>
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-white/10 backdrop-blur-xl border-l border-white/20 p-0 flex flex-col h-full">
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
