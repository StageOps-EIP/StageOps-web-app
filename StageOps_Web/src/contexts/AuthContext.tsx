import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type UserPublic } from '@/lib/api';

interface AuthState {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    isLoading: true,
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) {
      setState((s) => ({ ...s, isLoading: false }));
      return;
    }

    api
      .me()
      .then((user) => setState({ user, token: storedToken, isLoading: false }))
      .catch(() => {
        localStorage.removeItem('auth_token');
        setState({ user: null, token: null, isLoading: false });
      });
  }, []);

  async function login(email: string, password: string) {
    const { token } = await api.login(email, password);
    localStorage.setItem('auth_token', token);
    const user = await api.me();
    setState({ user, token, isLoading: false });
  }

  async function register(email: string, password: string) {
    const { token } = await api.register(email, password);
    localStorage.setItem('auth_token', token);
    const user = await api.me();
    setState({ user, token, isLoading: false });
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setState({ user: null, token: null, isLoading: false });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
