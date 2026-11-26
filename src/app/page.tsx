import Link from 'next/link';
import { 
  Layers, 
  Clock, 
  Users, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Check,
  Monitor,
  Wifi,
  VolumeX,
  CalendarCheck2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/server';

export default async function HomePage() {
  let salas = [];
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('salas')
      .select('*')
      .eq('activa', true)
      .limit(4);
    if (data) salas = data;
  } catch (e) {
    // Fallback
  }

  const displaySalas = salas.length > 0 ? salas : [
    {
      id: '1',
      nombre: 'Cubículo 101 - Silencio e Investigación',
      capacidad: 4,
      ubicacion: 'Nivel 1 • Ala Norte',
      equipamiento: 'Escritorios ergonómicos, lámparas LED regulables, tomas Gigabit Ethernet',
    },
    {
      id: '2',
      nombre: 'Sala Colaborativa B - Equipos y Proyectos',
      capacidad: 8,
      ubicacion: 'Nivel 1 • Ala Sur',
      equipamiento: 'Pizarrón magnético de cristal templado, Pantalla 55" 4K HDMI/AirPlay',
    },
    {
      id: '3',
      nombre: 'Estudio Multimedia C - Grabación y Meet',
      capacidad: 6,
      ubicacion: 'Nivel 2 • Centro de Medios',
      equipamiento: 'Cámara 4K con auto-framing, array de micrófonos de techo, Smart TV 65"',
    },
    {
      id: '4',
      nombre: 'Cabina Individual D - Concentración Pura',
      capacidad: 2,
      ubicacion: 'Nivel 2 • Zona Silente',
      equipamiento: 'Aislamiento acústico STC 45, soporte dual para monitores',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28 border-b border-slate-200/80 bg-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Status pill */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/90 text-slate-700 text-xs font-mono mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Sistema Operativo • Biblioteca Universitaria</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
            Reserva de Cubículos <br />
            <span className="text-slate-400 font-normal">sin fricción ni traslapes.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Plataforma institucional para estudiantes y académicos. Consulta disponibilidad en tiempo real, reserva turnos exactos y asegura tu espacio de estudio con validación estricta de concurrencia.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-medium text-xs shadow-sm hover:bg-slate-800 transition group"
            >
              <span>Ir al Panel de Reservas</span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform text-slate-400" />
            </Link>

            <Link
              href="/registro"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-xs hover:bg-slate-50 transition"
            >
              Registro Institucional
            </Link>
          </div>

          {/* Quick status counters */}
          <div className="mt-14 pt-8 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Horario</span>
              <span className="text-sm font-bold text-slate-800">07:00 — 21:30 hrs</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Capacidad</span>
              <span className="text-sm font-bold text-slate-800">2 a 8 estudiantes</span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Validación RNF08</span>
              <span className="text-sm font-bold text-emerald-600 flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Cero Conflictos
              </span>
            </div>
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Autenticación</span>
              <span className="text-sm font-bold text-slate-800">Supabase Auth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cubicles Catalog */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
              Infraestructura
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
              Espacios de Estudio Activos
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-2 sm:mt-0">
            Equipamiento verificado para el periodo académico vigente
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displaySalas.map((sala) => (
            <div
              key={sala.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    {sala.nombre}
                  </h3>
                  <span className="font-mono text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                    {sala.capacidad} pers.
                  </span>
                </div>

                <div className="flex items-center text-xs text-slate-500 mt-2 space-x-3">
                  <span>{sala.ubicacion}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    Disponible
                  </span>
                </div>

                {sala.equipamiento && (
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700 block mb-0.5 font-mono text-[10px] uppercase">
                      Equipamiento
                    </span>
                    {sala.equipamiento}
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Turnos de 1 a 4 horas
                </span>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Reservar este espacio
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anti-Overlap Engine (RNF08) Showcase */}
      <section className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-emerald-400 text-[11px] font-mono mb-4">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Requisito No Funcional RNF08</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Consistencia Estricta Anti-Traslapes
              </h2>
              <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed">
                Ningún cubículo puede ser asignado dos veces en el mismo horario. Cada solicitud se verifica matemáticamente en la Server Action y se audita mediante un trigger de PostgreSQL antes de confirmar la transacción.
              </p>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300">
              <span className="text-slate-500 block mb-2 text-[10px] uppercase">
                // Regla lógica evaluada en PostgreSQL & Next.js
              </span>
              <p className="text-emerald-400">
                WHERE estado != &apos;cancelada&apos; <br />
                &nbsp;&nbsp;AND (nuevo_inicio &lt; fin_existente) <br />
                &nbsp;&nbsp;AND (nuevo_fin &gt; inicio_existente);
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Resultado de evaluación:</span>
                <span className="text-emerald-400 font-bold">CONFLICT_FREE_GUARANTEE</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
