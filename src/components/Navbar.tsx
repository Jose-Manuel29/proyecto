'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
  CalendarRange, 
  Shield, 
  LogOut, 
  User, 
  Menu, 
  X,
  Sparkles,
  Layers,
  ArrowUpRight
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
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="group flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold tracking-tight shadow-sm group-hover:scale-105 transition-transform">
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight text-slate-900 group-hover:text-slate-800 flex items-center">
                  BiblioSalas
                  <span className="ml-1.5 inline-block text-[10px] font-mono font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                    PROD
                  </span>
                </span>
                <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                  Sistema de Reserva de Cubículos
                </span>
              </div>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    pathname === '/dashboard'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <CalendarRange className="w-3.5 h-3.5 mr-1.5" />
                  Mis Reservaciones
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      pathname.startsWith('/admin')
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                    Panel Administrativo
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 pl-3 py-1 pr-2 rounded-full border border-slate-200/80 bg-slate-50/80 text-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-medium text-slate-700 max-w-[140px] truncate">
                    {profile?.nombre_completo || user.email}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isAdmin
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {isAdmin ? 'Admin' : 'Alumno'}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                  title="Cerrar sesión segura"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  {isLoggingOut ? 'Saliendo...' : 'Cerrar Sesión'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                >
                  <span>Crear Cuenta</span>
                  <ArrowUpRight className="w-3 h-3 ml-1 text-slate-400" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {user ? (
            <>
              <div className="p-3 bg-slate-50 rounded-xl mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {profile?.nombre_completo || user.email}
                  </p>
                  <p className="text-[11px] text-slate-500">{profile?.correo_institucional}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Alumno'}
                </span>
              </div>

              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                <CalendarRange className="w-4 h-4 mr-2.5 text-slate-600" />
                Mis Reservaciones
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  <Shield className="w-4 h-4 mr-2.5 text-purple-600" />
                  Panel Administrativo
                </Link>
              )}

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4 mr-2.5" />
                {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
              </button>
            </>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/registro"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-2 px-3 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Registrar Cuenta Institucional
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
