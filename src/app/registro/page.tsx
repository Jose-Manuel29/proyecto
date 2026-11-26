'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { BookOpen, UserPlus, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

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

    // Validar nombre completo
    if (!nombreCompleto.trim()) {
      setError('Por favor ingresa tu nombre completo.');
      return;
    }

    // Validación de correo institucional configurable
    const institutionalDomain = process.env.NEXT_PUBLIC_INSTITUTIONAL_EMAIL_DOMAIN;
    if (institutionalDomain && !email.toLowerCase().endsWith(institutionalDomain.toLowerCase())) {
      setError(`Debes utilizar un correo institucional que termine en "${institutionalDomain}".`);
      return;
    }

    // Validar formato de correo básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Ingresa un formato de correo electrónico válido.');
      return;
    }

    // Validar contraseñas
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

      // Si Supabase tiene confirmación de correo desactivada (por defecto en local o según config), ya hay sesión
      if (data.session) {
        if (rol === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      } else {
        setSuccessMessage(
          '¡Registro exitoso! Si tu proyecto tiene activada la confirmación por correo, por favor revisa tu bandeja de entrada para verificar tu cuenta antes de iniciar sesión.'
        );
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'Error inesperado durante el registro.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Crear Cuenta Institucional
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Regístrate para reservar salas de estudio de la biblioteca
          </p>
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <p className="font-semibold">Error en el registro</p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-3 text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold">¡Cuenta creada!</p>
              <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
              <Link
                href="/login"
                className="mt-3 inline-flex items-center text-xs font-bold text-emerald-900 underline"
              >
                Ir a Iniciar Sesión <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Carlos Mendoza Silva"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Correo Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cmendoza@universidad.edu"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Usa tu correo institucional asignado por la universidad.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caract."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Confirmar
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite clave"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Rol en la Institución
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRol('estudiante')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                    rol === 'estudiante'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Estudiante
                </button>
                <button
                  type="button"
                  onClick={() => setRol('admin')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition ${
                    rol === 'admin'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Administrador
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Completar Registro</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
          ¿Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center"
          >
            Iniciar Sesión <ArrowRight className="w-3 h-3 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
