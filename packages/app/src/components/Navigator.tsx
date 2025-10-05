"use client";
import Link from 'next/link';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export default function Navigator() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="w-full bg-white shadow-md mb-8">
      <div className="max-w-3xl mx-auto flex items-center justify-between py-4 px-6">
        <Link href="/" className="text-2xl font-bold text-indigo-700">AviaZhan</Link>
        <div className="flex items-center gap-4">
          {!user && (
            <>
              <Link href="/login" className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition">Войти</Link>
              <Link href="/register" className="px-4 py-2 rounded bg-gray-100 text-indigo-700 hover:bg-gray-200 transition">Регистрация</Link>
            </>
          )}
          {user && (
            <>
              <Link href="/profile" className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">Мои билеты</Link>
              {user.role && user.role.toUpperCase() === 'ADMIN' && (
                <Link href="/admin" className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">Админ-панель</Link>
              )}
              {user.role && user.role.toUpperCase() === 'MANAGER' && (
                <Link href="/manager" className="px-4 py-2 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition">Менеджер-панель</Link>
              )}
              <button onClick={logout} className="px-4 py-2 rounded bg-red-100 text-red-700 hover:bg-red-200 transition">Выйти</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
