export type UserRole = 'estudiante' | 'admin';

export type ReservationStatus = 'pendiente' | 'confirmada' | 'finalizada' | 'cancelada';

export interface Profile {
  id: string;
  nombre_completo: string;
  correo_institucional: string;
  rol: UserRole;
  created_at: string;
}

export interface Sala {
  id: string;
  nombre: string;
  capacidad: number;
  ubicacion: string;
  equipamiento: string | null;
  activa: boolean;
  created_at: string;
}

export interface Reservacion {
  id: string;
  usuario_id: string;
  sala_id: string;
  fecha: string; // YYYY-MM-DD
  hora_inicio: string; // HH:MM:SS or HH:MM
  hora_fin: string; // HH:MM:SS or HH:MM
  motivo: string | null;
  estado: ReservationStatus;
  created_at: string;
  // Joins
  sala?: Sala;
  usuario?: Profile;
}
