import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminClient from '@/components/admin/AdminClient';
import { Sala, Reservacion, Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirect=/admin');
  }

  // Verificar que el usuario tenga rol 'admin'
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'admin') {
    redirect('/dashboard');
  }

  // 1. Obtener todas las salas (incluso inactivas)
  const { data: salasData } = await supabase
    .from('salas')
    .select('*')
    .order('created_at', { ascending: true });

  // 2. Obtener todas las reservaciones institucionales con relación de sala y usuario
  const { data: reservacionesData } = await supabase
    .from('reservaciones')
    .select(`
      *,
      sala:salas(*),
      usuario:profiles(*)
    `)
    .order('fecha', { ascending: false })
    .order('hora_inicio', { ascending: false });

  // 3. Obtener todos los perfiles de usuario
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminClient
      initialSalas={(salasData as Sala[]) || []}
      initialReservaciones={(reservacionesData as Reservacion[]) || []}
      profiles={(profilesData as Profile[]) || []}
    />
  );
}
