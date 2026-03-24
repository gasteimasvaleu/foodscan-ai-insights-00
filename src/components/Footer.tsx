import React from 'react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-background/80 backdrop-blur-md border-t border-border pb-20 sm:pb-4">
      <div className="container mx-auto px-4 py-4">
        <p className="text-muted-foreground text-xs text-center">
          © {currentYear} We Diet. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};