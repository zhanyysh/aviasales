"use client";
import { useState, useEffect } from 'react';
import AuthContext, { AuthContextType } from './AuthContext';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);

  useEffect(() => {
    // Пример: получаем токен из localStorage и парсим пользователя
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      // В реальном проекте лучше декодировать JWT или запрашивать профиль
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      if (userData && userData.id) setUser(userData);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
