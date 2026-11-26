'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Layers, UserPlus, AlertCircle, CheckCircle2, ArrowRight, Mail, KeyRound, User } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState<'estudiante' | 'admin'>('estudiante');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!nombreCompleto.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    const institutionalDomain = process.env.NEXT_PUBLIC_INSTITUTIONAL_EMAIL_DOMAIN;
    if (institutionalDomain && !email.toLowerCase().endsWith(institutionalDomain.toLowerCase())) {
      setError(`Debes usar un correo institucional que termine en "${institutionalDomain}".`);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un formato de correo electrónico válido.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto.trim(),
            rol: rol,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        if (rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        setSuccessMessage(
          '¡Cuenta creada exitosamente! Puedes iniciar sesión de inmediato con tus credenciales.'
        );
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Error durante el registro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 bg-slate-50 bg-grid-pattern">
      <div className="w-full max-w-sm bg-white rounded-2xl p-7 border border-slate-200/90 shadow-sm">
        <div className="text-left mb-6">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold mb-4">
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Nueva Cuenta
          </h1>
          <p className="mt-1 text-xs text-slate-500 font-normal">
            Registro para reserva y uso de cubículos de biblioteca
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50/80 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">
            <div className="flex items-center space-x-2 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Registro exitoso</span>
            </div>
            <p className="text-emerald-700">{successMessage}</p>
            <Link
              href="/login"
              className="mt-3 inline-flex items-center text-xs font-bold text-slate-900 underline"
            >
              Iniciar Sesión ahora <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
                Nombre Completo
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  placeholder="Ej. Sofia Ramos"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
                />
                <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

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
                  placeholder="sramos@universidad.edu"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
                />
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
                  Clave
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mín. 6"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
                  Confirmar
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-medium uppercase text-slate-500 mb-1">
                Rol
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setRol('estudiante')}
                  className={`py-1.5 rounded-lg font-semibold transition ${
                    rol === 'estudiante'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setRol('admin')}
                  className={`py-1.5 rounded-lg font-semibold transition ${
                    rol === 'admin'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Administrador
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Completar Registro</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-500">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-slate-900 hover:underline"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
