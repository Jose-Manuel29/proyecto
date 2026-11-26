'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Layers, LogIn, AlertCircle, ArrowRight, KeyRound, Mail } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Credenciales no encontradas o incorrectas.');
        } else {
          setError(authError.message);
        }
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('rol')
        .eq('id', data.user.id)
        .single();

      if (profile?.rol === 'admin' && redirectPath === '/dashboard') {
        router.push('/admin');
      } else {
        router.push(redirectPath);
      }
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Error inesperado al iniciar sesión.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
      <div className="text-left mb-6">
        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4">
          <Layers className="w-4 h-4 text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          Acceso Institucional
        </h1>
        <p className="mt-1 text-xs text-slate-500 font-normal">
          Ingresa con tu correo universitario y clave de acceso
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
            Correo Institucional
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alumno@universidad.edu"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
            />
            <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
            />
            <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <LogIn className="w-3.5 h-3.5" />
              <span>Entrar al Portal</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
        ¿No tienes cuenta registrada?{' '}
        <Link
          href="/registro"
          className="font-semibold text-slate-900 hover:underline"
        >
          Crear cuenta
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50 bg-grid-pattern">
      <Suspense fallback={<div className="text-xs text-slate-500 font-mono">Cargando formulario...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
