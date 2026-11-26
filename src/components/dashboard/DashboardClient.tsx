'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Filter, 
  Check, 
  AlertCircle, 
  X, 
  Edit2, 
  Trash2, 
  Search, 
  RotateCcw,
  MapPin,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Sparkles
} from 'lucide-react';
import { Reservacion, Sala, Profile, ReservationStatus } from '@/types/database';
import { 
  createReservationAction, 
  updateReservationAction, 
  updateReservationStatusAction, 
  cancelReservationAction 
} from '@/actions/reservations';

interface DashboardClientProps {
  initialReservations: Reservacion[];
  salas: Sala[];
  profile: Profile | null;
}

export default function DashboardClient({
  initialReservations,
  salas,
  profile,
}: DashboardClientProps) {
  const router = useRouter();

  // Filters State (RF10)
  const [selectedSala, setSelectedSala] = useState<string>('all');
  const [selectedEstado, setSelectedEstado] = useState<string>('all');
  const [selectedFecha, setSelectedFecha] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Selected reservation for edit or cancel
  const [editingReservation, setEditingReservation] = useState<Reservacion | null>(null);
  const [cancelingReservation, setCancelingReservation] = useState<Reservacion | null>(null);

  // Form states & feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  // Summary Metrics (RF11)
  const stats = useMemo(() => {
    let pendientes = 0;
    let confirmadas = 0;
    let finalizadas = 0;
    let canceladas = 0;

    initialReservations.forEach((r) => {
      if (r.estado === 'pendiente') pendientes++;
      else if (r.estado === 'confirmada') confirmadas++;
      else if (r.estado === 'finalizada') finalizadas++;
      else if (r.estado === 'cancelada') canceladas++;
    });

    return {
      total: initialReservations.length,
      pendientes,
      confirmadas,
      finalizadas,
      canceladas,
    };
  }, [initialReservations]);

  // Real-time Filtered Reservations (RF10)
  const filteredReservations = useMemo(() => {
    return initialReservations.filter((res) => {
      if (selectedSala !== 'all' && res.sala_id !== selectedSala) return false;
      if (selectedEstado !== 'all' && res.estado !== selectedEstado) return false;
      if (selectedFecha && res.fecha !== selectedFecha) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const roomName = res.sala?.nombre?.toLowerCase() || '';
        const motivo = res.motivo?.toLowerCase() || '';
        if (!roomName.includes(query) && !motivo.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [initialReservations, selectedSala, selectedEstado, selectedFecha, searchQuery]);

  // Quick preset hour setter in create modal
  const applyTimePreset = (formElement: HTMLFormElement, start: string, end: string) => {
    const startInput = formElement.querySelector<HTMLInputElement>('input[name="hora_inicio"]');
    const endInput = formElement.querySelector<HTMLInputElement>('input[name="hora_fin"]');
    if (startInput) startInput.value = start;
    if (endInput) endInput.value = end;
  };

  // Handle Create Reservation
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createReservationAction(formData);

    if (result.error) {
      setFormError(result.error);
      setActionLoading(false);
    } else {
      setIsCreateModalOpen(false);
      setActionLoading(false);
      router.refresh();
    }
  };

  // Handle Edit Reservation
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateReservationAction(formData);

    if (result.error) {
      setFormError(result.error);
      setActionLoading(false);
    } else {
      setIsEditModalOpen(false);
      setEditingReservation(null);
      setActionLoading(false);
      router.refresh();
    }
  };

  // Handle Cancel Reservation (RF06)
  const handleConfirmCancel = async () => {
    if (!cancelingReservation) return;
    setActionLoading(true);

    const result = await cancelReservationAction(cancelingReservation.id);
    if (result.error) {
      alert(result.error);
    }

    setIsCancelModalOpen(false);
    setCancelingReservation(null);
    setActionLoading(false);
    router.refresh();
  };

  // Handle Quick Status Change (RF09)
  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setStatusMenuOpenId(null);
    setActionLoading(true);
    const result = await updateReservationStatusAction(id, newStatus);
    if (result.error) {
      alert(result.error);
    }
    setActionLoading(false);
    router.refresh();
  };

  const resetFilters = () => {
    setSelectedSala('all');
    setSelectedEstado('all');
    setSelectedFecha('');
    setSearchQuery('');
  };

  const getStatusBadge = (estado: ReservationStatus) => {
    switch (estado) {
      case 'pendiente':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200/80',
          dot: 'bg-amber-500',
          label: 'Pendiente',
        };
      case 'confirmada':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
          dot: 'bg-emerald-500',
          label: 'Confirmada',
        };
      case 'finalizada':
        return {
          pill: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Finalizada',
        };
      case 'cancelada':
        return {
          pill: 'bg-slate-50 text-slate-400 border-slate-200 line-through',
          dot: 'bg-slate-300',
          label: 'Cancelada',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Mis Reservaciones
            </h1>
            <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {stats.total} total
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Control de cubículos para <span className="font-semibold text-slate-700">{profile?.nombre_completo || 'Estudiante'}</span>
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition space-x-2 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Reservación</span>
        </button>
      </div>

      {/* RF11: Dashboard Metrics (Clean & Modern) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mt-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">
            Pendientes
          </span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.pendientes}</span>
            <span className="text-[11px] text-amber-600 font-medium">en espera</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">
            Próximas (Confirmadas)
          </span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-emerald-600">{stats.confirmadas}</span>
            <span className="text-[11px] text-emerald-600 font-medium">listas para uso</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">
            Finalizadas
          </span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-900">{stats.finalizadas}</span>
            <span className="text-[11px] text-slate-400 font-medium">completadas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm">
          <span className="text-[11px] font-mono uppercase text-slate-400 block font-medium">
            Liberadas / Canceladas
          </span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold font-mono text-slate-500">{stats.canceladas}</span>
            <span className="text-[11px] text-slate-400 font-medium">espacio devuelto</span>
          </div>
        </div>
      </div>

      {/* RF10: Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mt-6 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center space-x-2 font-semibold text-slate-700">
            <ListFilter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filtros en tiempo real</span>
          </div>
          {(selectedSala !== 'all' || selectedEstado !== 'all' || selectedFecha !== '' || searchQuery !== '') && (
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center font-medium"
            >
              <RotateCcw className="w-3 h-3 mr-1" /> Restablecer filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Sala */}
          <div>
            <select
              value={selectedSala}
              onChange={(e) => setSelectedSala(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            >
              <option value="all">Todas las Salas</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            >
              <option value="all">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Fecha */}
          <div>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Búsqueda */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por motivo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          </div>
        </div>
      </div>

      {/* Reservations List (RF04, RF05, RF06, RF09) */}
      <div className="mt-6 space-y-3">
        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-700">Sin reservaciones encontradas</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No hay turnos registrados con el filtro actual.
            </p>
            <button
              onClick={() => {
                resetFilters();
                setIsCreateModalOpen(true);
              }}
              className="mt-3 px-3 py-1.5 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800 transition"
            >
              Crear Nueva Reservación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredReservations.map((res) => {
              const badge = getStatusBadge(res.estado);
              const room = res.sala;

              return (
                <div
                  key={res.id}
                  className={`bg-white rounded-xl border p-4 transition-all ${
                    res.estado === 'cancelada'
                      ? 'border-slate-200 bg-slate-50/40 opacity-70'
                      : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 text-sm">
                          {room?.nombre || 'Sala de Estudio'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.pill}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-1">
                        <span className="font-mono text-slate-700 font-medium">
                          {res.fecha}
                        </span>
                        <span className="font-mono text-slate-700">
                          {res.hora_inicio.slice(0, 5)} — {res.hora_fin.slice(0, 5)} hrs
                        </span>
                        {room?.ubicacion && (
                          <span className="flex items-center text-slate-400">
                            <MapPin className="w-3 h-3 mr-1" />
                            {room.ubicacion}
                          </span>
                        )}
                      </div>

                      {res.motivo && (
                        <p className="text-xs text-slate-500 pt-0.5">
                          <span className="font-medium text-slate-600">Motivo:</span> {res.motivo}
                        </p>
                      )}
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center space-x-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setStatusMenuOpenId(statusMenuOpenId === res.id ? null : res.id)
                          }
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                        >
                          <span>Estado</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {statusMenuOpenId === res.id && (
                          <div className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                            <button
                              onClick={() => handleStatusChange(res.id, 'pendiente')}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700"
                            >
                              Marcar Pendiente
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'confirmada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 font-medium text-emerald-700"
                            >
                              Marcar Confirmada
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'finalizada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-slate-50 font-medium text-slate-700"
                            >
                              Marcar Finalizada
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'cancelada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 font-medium text-red-600"
                            >
                              Marcar Cancelada
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Edit Button */}
                      {res.estado !== 'cancelada' && (
                        <button
                          onClick={() => {
                            setFormError(null);
                            setEditingReservation(res);
                            setIsEditModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                        >
                          <Edit2 className="w-3 h-3 text-slate-400" />
                          <span>Editar</span>
                        </button>
                      )}

                      {/* Cancel Button */}
                      {res.estado !== 'cancelada' && (
                        <button
                          onClick={() => {
                            setCancelingReservation(res);
                            setIsCancelModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Cancelar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: NUEVA RESERVACIÓN CON PRESETS DE HORARIO (RNF08) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Reservar Turno de Estudio</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form id="createReservationForm" onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Cubículo / Sala *
                </label>
                <select
                  name="sala_id"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                >
                  <option value="">-- Selecciona un espacio --</option>
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Cap: {s.capacidad}) • {s.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Fecha de Reserva *
                </label>
                <input
                  type="date"
                  name="fecha"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-400 mb-1">
                  Turnos rápidos de ejemplo
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      if (form) applyTimePreset(form, '09:00', '11:00');
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 text-[11px] font-mono hover:bg-slate-100"
                  >
                    09:00 - 11:00
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      if (form) applyTimePreset(form, '11:30', '13:30');
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 text-[11px] font-mono hover:bg-slate-100"
                  >
                    11:30 - 13:30
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      const form = e.currentTarget.closest('form');
                      if (form) applyTimePreset(form, '14:00', '16:00');
                    }}
                    className="py-1 px-2 rounded-lg border border-slate-200 text-[11px] font-mono hover:bg-slate-100"
                  >
                    14:00 - 16:00
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    required
                    defaultValue="09:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    required
                    defaultValue="11:00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Motivo de Estudio
                </label>
                <textarea
                  name="motivo"
                  rows={2}
                  placeholder="Ej. Preparación para proyecto de titulación..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Verificando cupo...' : 'Confirmar Reservación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR RESERVACIÓN (RF05) */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">Editar Reservación</h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingReservation(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5 text-xs">
              <input type="hidden" name="id" value={editingReservation.id} />

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Sala de Estudio *
                </label>
                <select
                  name="sala_id"
                  required
                  defaultValue={editingReservation.sala_id}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                >
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Cap: {s.capacidad})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  required
                  defaultValue={editingReservation.fecha}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    required
                    defaultValue={editingReservation.hora_inicio.slice(0, 5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    required
                    defaultValue={editingReservation.hora_fin.slice(0, 5)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase text-slate-500 mb-1">
                  Motivo
                </label>
                <textarea
                  name="motivo"
                  rows={2}
                  defaultValue={editingReservation.motivo || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingReservation(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMACIÓN DE CANCELACIÓN (RF06) */}
      {/* ========================================================================= */}
      {isCancelModalOpen && cancelingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-left">
            <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-3">
              <Trash2 className="w-4 h-4" />
            </div>

            <h3 className="font-bold text-sm text-slate-900">¿Liberar y cancelar reservación?</h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Cancelarás el turno en <span className="font-semibold text-slate-700">{cancelingReservation.sala?.nombre}</span> para el día <span className="font-semibold text-slate-700">{cancelingReservation.fecha}</span> ({cancelingReservation.hora_inicio.slice(0, 5)} - {cancelingReservation.hora_fin.slice(0, 5)}).
            </p>

            <div className="mt-5 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelingReservation(null);
                }}
                className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium"
              >
                Mantener turno
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmCancel}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
              >
                {actionLoading ? 'Cancelando...' : 'Sí, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
