'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { ReservationStatus } from '@/types/database';

export interface ActionResponse {
  success?: boolean;
  error?: string;
  data?: any;
}

/**
 * RNF08: Verifica si existe solapamiento de horarios en la misma sala y fecha.
 * Condición de traslape: (nueva_inicio < existente_fin) AND (nueva_fin > existente_inicio)
 */
async function checkOverlap(
  supabase: any,
  salaId: string,
  fecha: string,
  horaInicio: string,
  horaFin: string,
  excludeReservationId?: string
): Promise<boolean> {
  let query = supabase
    .from('reservaciones')
    .select('id, hora_inicio, hora_fin, estado')
    .eq('sala_id', salaId)
    .eq('fecha', fecha)
    .neq('estado', 'cancelada');

  if (excludeReservationId) {
    query = query.neq('id', excludeReservationId);
  }

  const { data: existingReservations, error } = await query;

  if (error || !existingReservations) {
    console.error('Error al consultar reservaciones para traslape:', error);
    return false;
  }

  // Normalizar strings a HH:MM para comparación
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const newStart = toMinutes(horaInicio);
  const newEnd = toMinutes(horaFin);

  for (const res of existingReservations) {
    const existingStart = toMinutes(res.hora_inicio);
    const existingEnd = toMinutes(res.hora_fin);

    // Condición de traslape de intervalos abiertos/semiabiertos
    if (newStart < existingEnd && newEnd > existingStart) {
      return true; // Existe conflicto
    }
  }

  return false;
}

export async function createReservationAction(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No has iniciado sesión o tu sesión ha expirado.' };
  }

  const sala_id = formData.get('sala_id') as string;
  const fecha = formData.get('fecha') as string;
  const hora_inicio = formData.get('hora_inicio') as string;
  const hora_fin = formData.get('hora_fin') as string;
  const motivo = (formData.get('motivo') as string) || '';

  if (!sala_id || !fecha || !hora_inicio || !hora_fin) {
    return { error: 'Por favor completa todos los campos requeridos.' };
  }

  if (hora_fin <= hora_inicio) {
    return { error: 'La hora de fin debe ser posterior a la hora de inicio.' };
  }

  // Comprobar que la fecha no sea en el pasado
  const today = new Date().toISOString().split('T')[0];
  if (fecha < today) {
    return { error: 'No es posible realizar reservaciones en fechas pasadas.' };
  }

  // Validación de Integridad RNF08 (Anti-traslape)
  const hasConflict = await checkOverlap(supabase, sala_id, fecha, hora_inicio, hora_fin);
  if (hasConflict) {
    return {
      error: 'RNF08 Conflicto de horario: La sala ya está reservada en ese rango horario. Por favor selecciona otro horario o sala.',
    };
  }

  const { data, error } = await supabase.from('reservaciones').insert([
    {
      usuario_id: user.id,
      sala_id,
      fecha,
      hora_inicio,
      hora_fin,
      motivo,
      estado: 'pendiente',
    },
  ]).select().single();

  if (error) {
    return { error: `Error al registrar la reservación: ${error.message}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true, data };
}

export async function updateReservationAction(formData: FormData): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado.' };
  }

  const id = formData.get('id') as string;
  const sala_id = formData.get('sala_id') as string;
  const fecha = formData.get('fecha') as string;
  const hora_inicio = formData.get('hora_inicio') as string;
  const hora_fin = formData.get('hora_fin') as string;
  const motivo = (formData.get('motivo') as string) || '';

  if (!id || !sala_id || !fecha || !hora_inicio || !hora_fin) {
    return { error: 'Datos incompletos para actualizar la reservación.' };
  }

  if (hora_fin <= hora_inicio) {
    return { error: 'La hora de fin debe ser posterior a la hora de inicio.' };
  }

  // Validación de Integridad RNF08 excluyendo la reservación actual
  const hasConflict = await checkOverlap(supabase, sala_id, fecha, hora_inicio, hora_fin, id);
  if (hasConflict) {
    return {
      error: 'RNF08 Conflicto de horario: La sala ya está ocupada en ese nuevo horario para la fecha seleccionada.',
    };
  }

  const { error } = await supabase
    .from('reservaciones')
    .update({
      sala_id,
      fecha,
      hora_inicio,
      hora_fin,
      motivo,
    })
    .eq('id', id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateReservationStatusAction(
  id: string,
  estado: ReservationStatus
): Promise<ActionResponse> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'No autenticado.' };
  }

  // Si reactiva una reservación cancelada, verificar traslape
  if (estado !== 'cancelada') {
    const { data: res } = await supabase
      .from('reservaciones')
      .select('sala_id, fecha, hora_inicio, hora_fin, estado')
      .eq('id', id)
      .single();

    if (res && res.estado === 'cancelada') {
      const hasConflict = await checkOverlap(
        supabase,
        res.sala_id,
        res.fecha,
        res.hora_inicio,
        res.hora_fin,
        id
      );
      if (hasConflict) {
        return {
          error: 'No se puede reactivar la reservación porque el horario ya fue ocupado por otra persona.',
        };
      }
    }
  }

  const { error } = await supabase
    .from('reservaciones')
    .update({ estado })
    .eq('id', id);

  if (error) {
    return { error: `Error al cambiar estado: ${error.message}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/admin');
  return { success: true };
}

export async function cancelReservationAction(id: string): Promise<ActionResponse> {
  return await updateReservationStatusAction(id, 'cancelada');
}
