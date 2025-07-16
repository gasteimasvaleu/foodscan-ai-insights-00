import { useState, useEffect } from 'react';

export const useRouter = () => {
  const [currentPath, setCurrentPath] = useState('/');

  useEffect(() => {
    // Get initial path
    const path = window.location.pathname || '/';
    setCurrentPath(path);

    // Listen to popstate (back/forward buttons)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  return { currentPath, navigate };
};