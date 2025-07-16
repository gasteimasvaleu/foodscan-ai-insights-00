import React from 'react';
import { useRouter } from '@/hooks/useRouter';

interface SimpleLinkProps {
  to: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const SimpleLink: React.FC<SimpleLinkProps> = ({ 
  to, 
  children, 
  className = '', 
  onClick 
}) => {
  const { navigate } = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
    onClick?.();
  };

  return (
    <a 
      href={to} 
      onClick={handleClick}
      className={className}
    >
      {children}
    </a>
  );
};