'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Users, 
  Plus, 
  Filter, 
  CheckCircle2, 
  Clock3, 
  AlertTriangle, 
  XCircle, 
  Edit3, 
  Trash2, 
  Search, 
  RotateCcw,
  BookOpen,
  MapPin,
  X,
  ChevronDown
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
      // Filter by Sala
      if (selectedSala !== 'all' && res.sala_id !== selectedSala) {
        return false;
      }
      // Filter by Estado
      if (selectedEstado !== 'all' && res.estado !== selectedEstado) {
        return false;
      }
      // Filter by Fecha
      if (selectedFecha && res.fecha !== selectedFecha) {
        return false;
      }
      // Filter by search query (motivo or room name)
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

  // Handle Cancel Reservation (RF06 with confirmation modal)
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

  // Reset filters
  const resetFilters = () => {
    setSelectedSala('all');
    setSelectedEstado('all');
    setSelectedFecha('');
    setSearchQuery('');
  };

  // Status Badge Colors & Labels
  const getStatusBadge = (estado: ReservationStatus) => {
    switch (estado) {
      case 'pendiente':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <Clock3 className="w-3.5 h-3.5 mr-1" />,
          label: 'Pendiente',
        };
      case 'confirmada':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          label: 'Confirmada / Próxima',
        };
      case 'finalizada':
        return {
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
          label: 'Finalizada',
        };
      case 'cancelada':
        return {
          bg: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
          label: 'Cancelada',
        };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with Title and Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Reservaciones
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Bienvenido, <span className="font-semibold text-slate-700">{profile?.nombre_completo || 'Estudiante'}</span>. 
            Gestiona tus turnos de salas de estudio en la biblioteca.
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all shrink-0 space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Reservación</span>
        </button>
      </div>

      {/* RF11: Dashboard Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pendientes
            </p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendientes}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">En espera de turno</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock3 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Próximas (Confirmadas)
            </p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.confirmadas}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Turnos activos listos</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Finalizadas
            </p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.finalizadas}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Completadas con éxito</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Reservaciones
            </p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {stats.canceladas} canceladas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* RF10: Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 mt-8 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>Filtros en Tiempo Real</span>
          </div>
          {(selectedSala !== 'all' || selectedEstado !== 'all' || selectedFecha !== '' || searchQuery !== '') && (
            <button
              onClick={resetFilters}
              className="text-indigo-600 hover:text-indigo-800 flex items-center font-semibold lowercase first-letter:uppercase"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Limpiar filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Sala Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filtrar por Sala
            </label>
            <select
              value={selectedSala}
              onChange={(e) => setSelectedSala(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todas las Salas</option>
              {salas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filtrar por Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="all">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Fecha Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Filtrar por Fecha
            </label>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Búsqueda de Motivo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Tesis, Examen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Reservations List / Cards (RF04, RF05, RF06, RF09) */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            Listado de Reservaciones ({filteredReservations.length})
          </h2>
          {actionLoading && (
            <span className="text-xs text-indigo-600 font-semibold flex items-center animate-pulse">
              Actualizando...
            </span>
          )}
        </div>

        {filteredReservations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron reservaciones</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">
              No hay reservaciones que coincidan con los filtros seleccionados o aún no has creado ninguna.
            </p>
            <button
              onClick={() => {
                resetFilters();
                setIsCreateModalOpen(true);
              }}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 font-semibold text-xs rounded-xl hover:bg-indigo-100 transition"
            >
              Crear Nueva Reservación
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredReservations.map((res) => {
              const badge = getStatusBadge(res.estado);
              const room = res.sala;
              const isPast = new Date(`${res.fecha}T${res.hora_fin}`) < new Date();

              return (
                <div
                  key={res.id}
                  className={`bg-white rounded-2xl border p-5 transition-all shadow-sm hover:shadow ${
                    res.estado === 'cancelada'
                      ? 'border-slate-200 opacity-75 bg-slate-50/50'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Room & Time Info */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-slate-900 text-base">
                          {room?.nombre || 'Sala de Estudio'}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.bg}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                        {isPast && res.estado !== 'finalizada' && res.estado !== 'cancelada' && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            (Horario transcurrido)
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center text-xs text-slate-600 gap-y-1 gap-x-4">
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span className="font-medium text-slate-800">{res.fecha}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                          <span>
                            {res.hora_inicio.slice(0, 5)} - {res.hora_fin.slice(0, 5)} hrs
                          </span>
                        </div>
                        {room?.ubicacion && (
                          <div className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            <span>{room.ubicacion}</span>
                          </div>
                        )}
                        {room?.capacidad && (
                          <div className="flex items-center">
                            <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                            <span>Capacidad: {room.capacidad} personas</span>
                          </div>
                        )}
                      </div>

                      {res.motivo && (
                        <p className="text-xs text-slate-500 pt-1">
                          <span className="font-semibold text-slate-600">Motivo:</span> {res.motivo}
                        </p>
                      )}
                    </div>

                    {/* Actions Panel */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      {/* RF09: Status Dropdown */}
                      <div className="relative">
                        <button
                          onClick={() =>
                            setStatusMenuOpenId(statusMenuOpenId === res.id ? null : res.id)
                          }
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition flex items-center space-x-1"
                        >
                          <span>Estado</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>

                        {statusMenuOpenId === res.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                            <button
                              onClick={() => handleStatusChange(res.id, 'pendiente')}
                              className="w-full text-left px-3 py-1.5 hover:bg-amber-50 text-amber-800 font-medium"
                            >
                              Marcar Pendiente
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'confirmada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-emerald-50 text-emerald-800 font-medium"
                            >
                              Marcar Confirmada
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'finalizada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-indigo-50 text-indigo-800 font-medium"
                            >
                              Marcar Finalizada
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'cancelada')}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-700 font-medium"
                            >
                              Marcar Cancelada
                            </button>
                          </div>
                        )}
                      </div>

                      {/* RF05: Edit Button (Only if not cancelled or completed) */}
                      {res.estado !== 'cancelada' && (
                        <button
                          onClick={() => {
                            setFormError(null);
                            setEditingReservation(res);
                            setIsEditModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition flex items-center space-x-1"
                          title="Editar fecha, horario o sala"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                          <span>Editar</span>
                        </button>
                      )}

                      {/* RF06: Cancel Button (with modal) */}
                      {res.estado !== 'cancelada' && (
                        <button
                          onClick={() => {
                            setCancelingReservation(res);
                            setIsCancelModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-medium text-red-600 bg-red-50/50 hover:bg-red-50 transition flex items-center space-x-1"
                          title="Cancelar reservación y liberar sala"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
      {/* MODAL: NUEVA RESERVACIÓN (RF03, RF07, RF08, RNF08) */}
      {/* ========================================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nueva Reservación</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-5 space-y-4">
              {/* Sala Selection (RF07) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecciona la Sala de Estudio *
                </label>
                <select
                  name="sala_id"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Elige una sala disponible --</option>
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Cap: {s.capacidad} pers.) - {s.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha (RF08) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha de la Reservación *
                </label>
                <input
                  type="date"
                  name="fecha"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Horas Inicio y Fin (RF08) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    required
                    defaultValue="09:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    required
                    defaultValue="11:00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo / Objetivo del Estudio (Opcional)
                </label>
                <textarea
                  name="motivo"
                  rows={2}
                  placeholder="Ej. Estudio para examen final de Cálculo, Trabajo en equipo..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition disabled:opacity-50"
                >
                  {actionLoading ? 'Verificando y Reservando...' : 'Confirmar Reservación'}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Edit3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Editar Reservación</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingReservation(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2.5 text-xs text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <input type="hidden" name="id" value={editingReservation.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Sala de Estudio *
                </label>
                <select
                  name="sala_id"
                  required
                  defaultValue={editingReservation.sala_id}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {salas.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} (Cap: {s.capacidad}) - {s.ubicacion}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  required
                  defaultValue={editingReservation.fecha}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Inicio *
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    required
                    defaultValue={editingReservation.hora_inicio.slice(0, 5)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hora Fin *
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    required
                    defaultValue={editingReservation.hora_fin.slice(0, 5)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo
                </label>
                <textarea
                  name="motivo"
                  rows={2}
                  defaultValue={editingReservation.motivo || ''}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingReservation(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-200 transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-900">¿Cancelar Reservación?</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Estás a punto de cancelar tu reservación en{' '}
              <span className="font-semibold text-slate-800">
                {cancelingReservation.sala?.nombre || 'la sala seleccionada'}
              </span>{' '}
              para el día <span className="font-semibold text-slate-800">{cancelingReservation.fecha}</span> de{' '}
              <span className="font-semibold text-slate-800">
                {cancelingReservation.hora_inicio.slice(0, 5)} a {cancelingReservation.hora_fin.slice(0, 5)}
              </span>.
            </p>

            <p className="mt-3 text-[11px] bg-amber-50 text-amber-800 p-2.5 rounded-xl border border-amber-200">
              Esta acción liberará el espacio para que otros estudiantes de la biblioteca puedan utilizarlo.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelingReservation(null);
                }}
                className="py-2.5 px-4 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
              >
                No, mantener
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleConfirmCancel}
                className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-red-200 transition disabled:opacity-50"
              >
                {actionLoading ? 'Cancelando...' : 'Sí, Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
