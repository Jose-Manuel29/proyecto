import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Endpoint de consulta rápida de disponibilidad de una sala para una fecha específica.
 * GET /api/availability?sala_id=...&fecha=YYYY-MM-DD
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sala_id = searchParams.get('sala_id');
    const fecha = searchParams.get('fecha');

    if (!sala_id || !fecha) {
      return NextResponse.json(
        { error: 'Parámetros requeridos faltantes: sala_id y fecha son obligatorios.' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    const { data: reservaciones, error } = await supabase
      .from('reservaciones')
      .select('id, hora_inicio, hora_fin, estado')
      .eq('sala_id', sala_id)
      .eq('fecha', fecha)
      .neq('estado', 'cancelada');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      sala_id,
      fecha,
      ocupado: reservaciones || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}
