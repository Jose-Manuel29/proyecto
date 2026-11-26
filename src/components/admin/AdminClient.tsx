'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Shield, 
  DoorOpen, 
  CalendarRange, 
  Users, 
  Plus, 
  Edit2, 
  Power, 
  Search, 
  X,
  AlertCircle,
  Check,
  Building
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

  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [isEditRoomOpen, setIsEditRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Sala | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [adminStatusFilter, setAdminStatusFilter] = useState<string>('all');
  const [adminSalaFilter, setAdminSalaFilter] = useState<string>('all');
  const [adminSearch, setAdminSearch] = useState<string>('');

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

  const handleToggleRoom = async (id: string, currentStatus: boolean) => {
    setActionLoading(true);
    const result = await toggleRoomStatusAction(id, !currentStatus);
    if (result.error) {
      alert(result.error);
    }
    setActionLoading(false);
    router.refresh();
  };

  const handleAdminStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setActionLoading(true);
    const result = await updateReservationStatusAction(id, newStatus);
    if (result.error) {
      alert(result.error);
    }
    setActionLoading(false);
    router.refresh();
  };

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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Gestión Administrativa
            </h1>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Supervisión integral de cubículos, turnos de alumnos y catálogo de espacios
          </p>
        </div>

        {activeTab === 'salas' && (
          <button
            onClick={() => {
              setFormError(null);
              setIsCreateRoomOpen(true);
            }}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition space-x-2 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Sala / Cubículo</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mt-6 space-x-2 text-xs">
        <button
          onClick={() => setActiveTab('salas')}
          className={`flex items-center space-x-2 px-3.5 py-2.5 font-semibold border-b-2 transition ${
            activeTab === 'salas'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Building className="w-3.5 h-3.5" />
          <span>Salas ({initialSalas.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservaciones')}
          className={`flex items-center space-x-2 px-3.5 py-2.5 font-semibold border-b-2 transition ${
            activeTab === 'reservaciones'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <CalendarRange className="w-3.5 h-3.5" />
          <span>Turnos Registrados ({initialReservaciones.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('usuarios')}
          className={`flex items-center space-x-2 px-3.5 py-2.5 font-semibold border-b-2 transition ${
            activeTab === 'usuarios'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Usuarios ({profiles.length})</span>
        </button>
      </div>

      {/* TAB 1: SALAS */}
      {activeTab === 'salas' && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {initialSalas.map((sala) => (
            <div
              key={sala.id}
              className={`bg-white rounded-xl border p-4.5 flex flex-col justify-between transition-all ${
                sala.activa ? 'border-slate-200/90 shadow-sm' : 'border-slate-200 bg-slate-50/60 opacity-60'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-xs tracking-tight">{sala.nombre}</h3>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      sala.activa
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {sala.activa ? 'Activa' : 'Desactivada'}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {sala.ubicacion} • Capacidad: {sala.capacidad} estudiantes
                </p>

                {sala.equipamiento && (
                  <p className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-mono text-[10px] uppercase text-slate-400 block mb-0.5">Equipamiento</span>
                    {sala.equipamiento}
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setFormError(null);
                    setEditingRoom(sala);
                    setIsEditRoomOpen(true);
                  }}
                  className="font-medium text-slate-600 hover:text-slate-900 flex items-center"
                >
                  <Edit2 className="w-3 h-3 mr-1 text-slate-400" /> Editar
                </button>

                <button
                  onClick={() => handleToggleRoom(sala.id, sala.activa)}
                  disabled={actionLoading}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    sala.activa
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {sala.activa ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: RESERVACIONES */}
      {activeTab === 'reservaciones' && (
        <div className="mt-6 space-y-3">
          <div className="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <select
              value={adminSalaFilter}
              onChange={(e) => setAdminSalaFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50"
            >
              <option value="all">Todas las Salas</option>
              {initialSalas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>

            <select
              value={adminStatusFilter}
              onChange={(e) => setAdminStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50"
            >
              <option value="all">Todos los Estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </select>

            <div className="relative">
              <input
                type="text"
                placeholder="Filtrar por alumno o correo..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50/50"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Estudiante</th>
                    <th className="px-4 py-2.5">Cubículo</th>
                    <th className="px-4 py-2.5">Fecha y Turno</th>
                    <th className="px-4 py-2.5">Motivo</th>
                    <th className="px-4 py-2.5">Estado</th>
                    <th className="px-4 py-2.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5">
                        <span className="font-semibold text-slate-900 block">
                          {res.usuario?.nombre_completo || 'Usuario'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {res.usuario?.correo_institucional}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 font-medium">
                        {res.sala?.nombre}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 font-mono text-[11px]">
                        <span className="font-bold text-slate-800">{res.fecha}</span> • {res.hora_inicio.slice(0, 5)} - {res.hora_fin.slice(0, 5)}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate">
                        {res.motivo || '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            res.estado === 'confirmada'
                              ? 'bg-emerald-50 text-emerald-700'
                              : res.estado === 'pendiente'
                              ? 'bg-amber-50 text-amber-700'
                              : res.estado === 'finalizada'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-slate-100 text-slate-400 line-through'
                          }`}
                        >
                          {res.estado}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <select
                          value={res.estado}
                          onChange={(e) =>
                            handleAdminStatusChange(res.id, e.target.value as ReservationStatus)
                          }
                          className="px-2 py-1 rounded border border-slate-200 text-[11px] bg-white font-medium"
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
        <div className="mt-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[10px] uppercase">
              <tr>
                <th className="px-4 py-2.5">Nombre</th>
                <th className="px-4 py-2.5">Correo</th>
                <th className="px-4 py-2.5">Rol</th>
                <th className="px-4 py-2.5">Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-semibold text-slate-900">{p.nombre_completo}</td>
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                    {p.correo_institucional}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        p.rol === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {p.rol}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-400 font-mono text-[11px]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: CREAR SALA */}
      {isCreateRoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Agregar Nueva Sala</h3>
              <button
                onClick={() => setIsCreateRoomOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-lg flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRoom} className="mt-3 space-y-2.5">
              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  placeholder="Ej. Cubículo 204 - Proyectos"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Capacidad *</label>
                <input
                  type="number"
                  name="capacidad"
                  required
                  min="1"
                  defaultValue="4"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  required
                  placeholder="Nivel 2 • Ala Poniente"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Equipamiento</label>
                <textarea
                  name="equipamiento"
                  rows={2}
                  placeholder="Monitor 4K, pizarrón, etc."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
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
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  {actionLoading ? 'Guardando...' : 'Crear Sala'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR SALA */}
      {isEditRoomOpen && editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Editar Sala</h3>
              <button
                onClick={() => {
                  setIsEditRoomOpen(false);
                  setEditingRoom(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-2 bg-red-50 text-red-700 rounded-lg flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleEditRoom} className="mt-3 space-y-2.5">
              <input type="hidden" name="id" value={editingRoom.id} />
              <input type="hidden" name="activa" value={editingRoom.activa ? 'true' : 'false'} />

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  required
                  defaultValue={editingRoom.nombre}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Capacidad *</label>
                <input
                  type="number"
                  name="capacidad"
                  required
                  min="1"
                  defaultValue={editingRoom.capacidad}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  required
                  defaultValue={editingRoom.ubicacion}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-slate-500 mb-1">Equipamiento</label>
                <textarea
                  name="equipamiento"
                  rows={2}
                  defaultValue={editingRoom.equipamiento || ''}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
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
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
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
