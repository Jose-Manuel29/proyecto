import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import DashboardClient from '@/components/dashboard/DashboardClient';
import { Reservacion, Sala, Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/dashboard');
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Obtener salas activas disponibles para reservar (RF07)
  const { data: salasData } = await supabase
    .from('salas')
    .select('*')
    .eq('activa', true)
    .order('nombre', { ascending: true });

  // Obtener reservaciones del usuario (RF04) con detalles de la sala
  const { data: reservationsData, error } = await supabase
    .from('reservaciones')
    .select(`
      *,
      sala:salas(*)
    `)
    .eq('usuario_id', user.id)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false });

  if (error) {
    console.error('Error al cargar reservaciones:', error);
  }

  return (
    <DashboardClient
      initialReservations={(reservationsData as Reservacion[]) || []}
      salas={(salasData as Sala[]) || []}
      profile={profile as Profile | null}
    />
  );
}
