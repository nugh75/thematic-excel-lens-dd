import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface UserContextType {
  user: null | { id: string; username: string; role: string; email: string };
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserContextType['user']>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (t) {
      setToken(t);
      try {
        const decoded: any = jwtDecode(t);
        setUser({ id: decoded.id, username: decoded.username, role: decoded.role, email: decoded.email });
      } catch {
        setUser(null);
      }
    }
  }, []);

  const login = (t: string, u: any) => {
    setToken(t);
    setUser(u);
    localStorage.setItem('token', t);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
