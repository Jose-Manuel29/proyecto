import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import { createClient } from '@/utils/supabase/server';

export const metadata: Metadata = {
  title: 'BiblioSalas - Sistema de Reservación de Salas de Estudio',
  description:
    'Plataforma integral para la gestión y reservación de salas de estudio en bibliotecas universitarias.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let user = null;
  let profile = null;

  try {
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (authUser) {
      user = {
        id: authUser.id,
        email: authUser.email,
      };

      const { data: profileData } = await supabase
        .from('profiles')
        .select('nombre_completo, correo_institucional, rol')
        .eq('id', authUser.id)
        .single();

      profile = profileData;
    }
  } catch (e) {
    // Graceful fallback during static generation or unconfigured env
  }

  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-900 antialiased flex flex-col min-h-screen">
        <Navbar user={user} profile={profile} />
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4">
            <p>© {new Date().getFullYear()} BiblioSalas. Sistema de Reservaciones de Biblioteca Universitaria.</p>
            <p className="mt-1 text-slate-400">Next.js 14 App Router • Supabase PostgreSQL • Vercel Ready</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
