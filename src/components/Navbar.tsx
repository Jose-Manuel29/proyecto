'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  BookOpen, 
  Calendar, 
  ShieldCheck, 
  LogOut, 
  User, 
  Menu, 
  X,
  Home
} from 'lucide-react';

interface NavbarProps {
  user?: {
    id: string;
    email?: string;
  } | null;
  profile?: {
    nombre_completo: string;
    correo_institucional: string;
    rol: 'estudiante' | 'admin';
  } | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isAdmin = profile?.rol === 'admin';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Main Nav */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3 text-indigo-600 hover:text-indigo-700 transition">
              <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900">
                Biblio<span className="text-indigo-600">Salas</span>
              </span>
            </Link>

            {user && (
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition ${
                    pathname === '/dashboard'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Mis Reservaciones
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition ${
                      pathname.startsWith('/admin')
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Panel Administrativo
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {profile?.nombre_completo ? profile.nombre_completo.charAt(0) : 'U'}
                  </div>
                  <div className="text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800">
                      {profile?.nombre_completo || user.email}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase ${
                        isAdmin
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isAdmin ? 'Administrador' : 'Estudiante'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition disabled:opacity-50"
                  title="Cerrar Sesión (RF12)"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  {isLoggingOut ? 'Saliendo...' : 'Salir'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {user ? (
            <>
              <div className="flex items-center space-x-3 p-2 bg-slate-50 rounded-lg mb-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                  {profile?.nombre_completo ? profile.nombre_completo.charAt(0) : 'U'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {profile?.nombre_completo || user.email}
                  </p>
                  <p className="text-xs text-slate-500">{profile?.correo_institucional}</p>
                </div>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-indigo-50 rounded-lg"
              >
                <Calendar className="w-4 h-4 mr-3 text-indigo-600" />
                Mis Reservaciones
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 hover:bg-purple-50 rounded-lg"
                >
                  <ShieldCheck className="w-4 h-4 mr-3 text-purple-600" />
                  Panel Administrativo
                </Link>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-3" />
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
