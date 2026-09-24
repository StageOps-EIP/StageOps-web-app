import { useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { AuthContext, type AuthState } from './auth.context';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('auth_token');
    return { user: null, token, isLoading: Boolean(token) };
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (!storedToken) return;

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
