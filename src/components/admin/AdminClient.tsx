'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  DoorOpen, 
  Calendar, 
  Users, 
  Plus, 
  Edit3, 
  Power, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Search, 
  Filter, 
  X,
  AlertCircle
} from 'lucide-react';
import { Sala, Reservacion, Profile, ReservationStatus } from '@/types/database';
import { createRoomAction, updateRoomAction, toggleRoomStatusAction } from '@/actions/rooms';
import { updateReservationStatusAction } from '@/actions/reservations';

interface AdminClientProps {
  initialSalas: Sala[];
  initialReservaciones: Reservacion[];
  profiles: Profile[];
}

export default function AdminClient({
  initialSalas,
  initialReservaciones,
  profiles,
}: AdminClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'salas' | 'reservaciones' | 'usuarios'>('salas');

  // Rooms modals state
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Sala | null>(null);

  // Loading & error feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Reservation filters in admin
  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [adminSalaFilter, setAdminSalaFilter] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

  // Handle Create Room
  const handleCreateRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await createRoomAction(formData);

    if (result.error) {
      setFormError(result.error);
      setActionLoading(false);
    } else {
      setIsCreateRoomOpen(false);
      setActionLoading(false);
      router.refresh();
    }
  };

  // Handle Edit Room
  const handleEditRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await updateRoomAction(formData);

    if (result.error) {
      setFormError(result.error);
      setActionLoading(false);
    } else {
      setIsEditRoomOpen(false);
      setEditingRoom(null);
      setActionLoading(false);
      router.refresh();
    }
  };

  // Toggle Room Active/Inactive
  const handleToggleRoom = async (id: string, currentStatus: boolean) => {
    setActionLoading(true);
    const result = await toggleRoomStatusAction(id, !currentStatus);
    if (result.error) {
      alert(result.error);
    }
    setActionLoading(false);
    router.refresh();
  };

  // Handle Admin Status change for any reservation
  const handleAdminStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setActionLoading(true);
    const result = await updateReservationStatusAction(id, newStatus);
    if (result.error) {
      alert(result.error);
    }
    setActionLoading(false);
    router.refresh();
  };

  // Filtered reservations in admin
  const filteredReservations = initialReservaciones.filter((res) => {
    if (adminStatusFilter !== 'all' && res.estado !== adminStatusFilter) return false;
    if (adminSalaFilter !== 'all' && res.sala_id !== adminSalaFilter) return false;
    if (adminSearch.trim()) {
      const q = adminSearch.toLowerCase();
      const studentName = res.usuario?.nombre_completo?.toLowerCase() || '';
      const studentEmail = res.usuario?.correo_institucional?.toLowerCase() || '';
      const roomName = res.sala?.nombre?.toLowerCase() || '';
      if (!studentName.includes(q) && !studentEmail.includes(q) && !roomName.includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Zona de Administración</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control de Biblioteca
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestiona salas de estudio, equipamiento, usuarios y supervisa todas las reservaciones institucionales.
          </p>
        </div>

        {activeTab === 'salas' && (
          <button
            onClick={() => {
              setFormError(null);
              setIsCreateRoomOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md shadow-purple-200 transition shrink-0 space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sala de Estudio</span>
          </button>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 mt-6 space-x-2">
        <button
          onClick={() => setActiveTab('salas')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'salas'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Salas de Estudio ({initialSalas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservaciones')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'reservaciones'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Todas las Reservaciones ({initialReservaciones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-semibold border-b-2 transition ${
            activeTab === 'usuarios'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Usuarios Registrados ({profiles.length})</span>
        </button>
      </div>

      {/* TAB 1: GESTIÓN DE SALAS */}
      {activeTab === 'salas' && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {initialSalas.map((sala) => (
              <div
                key={sala.id}
                className={`bg-white rounded-2xl border p-5 shadow-sm transition flex flex-col justify-between ${
                  sala.activa ? 'border-slate-200/90' : 'border-slate-200 bg-slate-50 opacity-70'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-slate-900 text-base">{sala.nombre}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        sala.activa
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sala.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mt-1">Ubicación: {sala.ubicacion}</p>
                  <p className="text-xs text-indigo-600 font-semibold mt-1">
                    Capacidad: {sala.capacidad} estudiantes
                  </p>

                  {sala.equipamiento && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700 block mb-0.5">Equipamiento:</span>
                      {sala.equipamiento}
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setFormError(null);
                      setEditingRoom(sala);
                      setIsEditRoomOpen(true);
                    }}
                    className="inline-flex items-center text-xs font-semibold text-slate-700 hover:text-purple-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1" /> Editar
                  </button>

                  <button
                    onClick={() => handleToggleRoom(sala.id, sala.activa)}
                    disabled={actionLoading}
                    className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      sala.activa
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power className="w-3 h-3 mr-1" />
                    {sala.activa ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TODAS LAS RESERVACIONES */}
      {activeTab === 'reservaciones' && (
        <div className="mt-6 space-y-4">
          {/* Admin filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filtrar por Sala
              </label>
              <select
                value={adminSalaFilter}
                onChange={(e) => setAdminSalaFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">Todas las Salas</option>
                {initialSalas.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Filtrar por Estado
              </label>
              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="all">Todos los Estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="finalizada">Finalizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                Buscar Estudiante / Correo
              </label>
              <input
                type="text"
                placeholder="Nombre o correo institucional..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Estudiante</th>
                    <th className="px-4 py-3">Sala</th>
                    <th className="px-4 py-3">Fecha y Horario</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3 text-right">Acción Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {res.usuario?.nombre_completo || 'Usuario'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {res.usuario?.correo_institucional}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {res.sala?.nombre || 'Sala'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span className="font-semibold text-slate-800">{res.fecha}</span>
                        <span className="block text-[11px] text-slate-500">
                          {res.hora_inicio.slice(0, 5)} - {res.hora_fin.slice(0, 5)} hrs
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 max-w-xs truncate">
                        {res.motivo || 'Sin motivo especificado'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            res.estado === 'confirmada'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.estado === 'pendiente'
                              ? 'bg-amber-100 text-amber-800'
                              : res.estado === 'finalizada'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {res.estado}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={res.estado}
                          onChange={(e) =>
                            handleAdminStatusChange(res.id, e.target.value as ReservationStatus)
                          }
                          className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] bg-white font-medium"
                        >
                          <option value="pendiente">Pendiente</option>
                          <option value="confirmada">Confirmada</option>
                          <option value="finalizada">Finalizada</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USUARIOS */}
      {activeTab === 'usuarios' && (
        <div className="mt-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nombre Completo</th>
                  <th className="px-4 py-3">Correo Institucional</th>
                  <th className="px-4 py-3">Rol del Sistema</th>
                  <th className="px-4 py-3">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.nombre_completo}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                      {p.correo_institucional}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          p.rol === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.rol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR SALA */}
      {/* ========================================================================= */}
      {isCreateRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <DoorOpen className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900">Agregar Nueva Sala de Estudio</h3>
              </div>
              <button
                onClick={() => setIsCreateRoomOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Sala *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Sala E - Robótica y Proyectos"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacidad (Estudiantes) *</label>
                <input
                  type="number"
                  name="capacidad"
                  required
                  min="1"
                  defaultValue="6"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación Física *</label>
                <input
                  type="text"
                  name="ubicacion"
                  required
                  placeholder="Ej. Piso 3 - Ala Oriente"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipamiento</label>
                <textarea
                  name="equipamiento"
                  rows={2}
                  placeholder="Ej. Proyector láser, Pizarrón magnético, 6 computadoras..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateRoomOpen(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  {actionLoading ? 'Guardando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR SALA */}
      {/* ========================================================================= */}
      {isEditRoomOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Edit3 className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900">Editar Sala de Estudio</h3>
              </div>
              <button
                onClick={() => {
                  setIsEditRoomOpen(false);
                  setEditingRoom(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2.5 bg-red-50 text-red-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditRoom} className="mt-4 space-y-3 text-xs">
              <input type="hidden" name="id" value={editingRoom.id} />
              <input type="hidden" name="activa" value={editingRoom.activa ? 'true' : 'false'} />

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nombre de la Sala *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  defaultValue={editingRoom.nombre}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Capacidad *</label>
                <input
                  type="number"
                  name="capacidad"
                  required
                  min="1"
                  defaultValue={editingRoom.capacidad}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  required
                  defaultValue={editingRoom.ubicacion}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipamiento</label>
                <textarea
                  name="equipamiento"
                  rows={2}
                  defaultValue={editingRoom.equipamiento || ''}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditRoomOpen(false);
                    setEditingRoom(null);
                  }}
                  className="px-3 py-1.5 border border-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold"
                >
                  {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
