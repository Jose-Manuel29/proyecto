'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { ActionResponse } from './reservations';

export async function createRoomAction(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado' };
  }

  // Verificar rol admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'admin') {
    return { error: 'Acceso denegado: solo administradores pueden crear salas.' };
  }

  const nombre = formData.get('nombre') as string;
  const capacidad = parseInt(formData.get('capacidad') as string, 10);
  const ubicacion = formData.get('ubicacion') as string;
  const equipamiento = (formData.get('equipamiento') as string) || '';

  if (!nombre || isNaN(capacidad) || capacidad <= 0 || !ubicacion) {
    return { error: 'Por favor ingresa información válida (nombre, capacidad mayor a 0 y ubicación).' };
  }

  const { data, error } = await supabase
    .from('salas')
    .insert([
      {
        nombre,
        capacidad,
        ubicacion,
        equipamiento,
        activa: true,
      },
    ])
    .select()
    .single();

  if (error) {
    return { error: `Error al crear sala: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true, data };
}

export async function updateRoomAction(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'admin') {
    return { error: 'Acceso denegado: solo administradores pueden editar salas.' };
  }

  const id = formData.get('id') as string;
  const nombre = formData.get('nombre') as string;
  const capacidad = parseInt(formData.get('capacidad') as string, 10);
  const ubicacion = formData.get('ubicacion') as string;
  const equipamiento = (formData.get('equipamiento') as string) || '';
  const activa = formData.get('activa') === 'true';

  if (!id || !nombre || isNaN(capacidad) || capacidad <= 0 || !ubicacion) {
    return { error: 'Por favor ingresa datos válidos.' };
  }

  const { error } = await supabase
    .from('salas')
    .update({
      nombre,
      capacidad,
      ubicacion,
      equipamiento,
      activa,
    })
    .eq('id', id);

  if (error) {
    return { error: `Error al actualizar sala: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function toggleRoomStatusAction(id: string, activa: boolean): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autorizado' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('rol')
    .eq('id', user.id)
    .single();

  if (profile?.rol !== 'admin') {
    return { error: 'Acceso denegado: solo administradores pueden cambiar el estado de salas.' };
  }

  const { error } = await supabase
    .from('salas')
    .update({ activa })
    .eq('id', id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  revalidatePath('/admin');
  revalidatePath('/dashboard');
  return { success: true };
}
