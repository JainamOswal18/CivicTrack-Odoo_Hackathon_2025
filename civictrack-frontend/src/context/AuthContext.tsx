// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
// import API from '../services/api';
// import { User } from '../types';

// interface AuthCtx {
//   user: User | null;
//   loading: boolean;
//   login(email: string, password: string): Promise<void>;
//   register(email: string, password: string, username?: string): Promise<void>;
//   logout(): void;
// }

// const AuthContext = createContext<AuthCtx | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       API.get('/auth/me')
//         .then(res => setUser(res.data.user))
//         .catch(() => localStorage.removeItem('token'))
//         .finally(() => setLoading(false));
//     } else {
//       setLoading(false);
//     }
//   }, []);

//   const login = async (email: string, password: string) => {
//     const res = await API.post('/auth/login', { email, password });
//     localStorage.setItem('token', res.data.token);
//     setUser(res.data.user);
//   };

//   const register = async (
//   email: string,
//   password: string,
//   username?: string,
//   number?: string 
// ) => {
//   const res = await API.post('/auth/register', { email, password, username, number });
//   localStorage.setItem('token', res.data.token);
//   setUser(res.data.user);
// };

//   const logout = () => {
//     localStorage.removeItem('token');
//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider value={{ user, loading, login, register, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const ctx = useContext(AuthContext);
//   if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
//   return ctx;
// };
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import API from '../services/api';
import { User } from '../types';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string, username?: string, number?: string): Promise<void>; // ✅ updated to include number
  logout(): void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      API.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const register = async (
    email: string,
    password: string,
    username?: string,
    number?: string 
  ) => {
    const res = await API.post('/auth/register', {
      email,
      password,
      username,
      number, 
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
