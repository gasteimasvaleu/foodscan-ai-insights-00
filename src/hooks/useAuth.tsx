import { useAuthContext } from '@/contexts/AuthProvider';

export const useAuth = () => {
  return useAuthContext();
};
