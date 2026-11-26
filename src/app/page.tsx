import Link from 'next/link';
import { 
  BookOpen, 
  CalendarCheck, 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Sparkles
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
    // Fallback if not connected yet
  }

  // Fallback demo rooms if Supabase is still connecting
  const displaySalas = salas.length > 0 ? salas : [
    {
      id: '1',
      nombre: 'Sala A - Silenciosa e Individual',
      capacidad: 4,
      ubicacion: 'Piso 1 - Ala Norte',
      equipamiento: 'Escritorios ergonómicos, lámparas LED y tomas de red',
    },
    {
      id: '2',
      nombre: 'Sala B - Trabajo Colaborativo',
      capacidad: 8,
      ubicacion: 'Piso 1 - Ala Sur',
      equipamiento: 'Mesa redonda, Pizarrón magnético y Pantalla 55" HDMI',
    },
    {
      id: '3',
      nombre: 'Sala C - Multimedia y Videoconferencias',
      capacidad: 6,
      ubicacion: 'Piso 2 - Centro de Medios',
      equipamiento: 'Cámara 4K, audio para videollamadas y Smart TV 65"',
    },
    {
      id: '4',
      nombre: 'Sala D - Tesis e Investigación',
      capacidad: 3,
      ubicacion: 'Piso 2 - Ala Poniente',
      equipamiento: 'Aislamiento acústico de alto nivel y monitor dual',
    },
  ];

  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 py-16 sm:py-24 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Biblioteca Universitaria • Reservaciones en Línea</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Encuentra y Reserva tu <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Espacio de Estudio Ideal
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Gestiona tus turnos de estudio con confirmación instantánea y validación
            automática anti-traslape de horarios. Diseñado para estudiantes y docentes.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all duration-200 text-base group"
            >
              <span>Acceder al Sistema</span>
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/registro"
              className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 transition duration-200 text-base"
            >
              Registrar Cuenta Institucional
            </Link>
          </div>

          {/* Quick Features pill list */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-200/60">
            <div className="flex items-center space-x-2.5 text-slate-700 text-sm justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Validación Anti-traslapes</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 text-sm justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Filtros en Tiempo Real</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 text-sm justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Gestión de Estados</span>
            </div>
            <div className="flex items-center space-x-2.5 text-slate-700 text-sm justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Panel de Administración</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Salas de Estudio Disponibles
            </h2>
            <p className="mt-2 text-slate-600">
              Espacios climatizados, aislados acústicamente y equipados con tecnología moderna.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="mt-4 md:mt-0 text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            Ver disponibilidad en el Dashboard <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displaySalas.map((sala) => (
            <div
              key={sala.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-bold text-slate-900">{sala.nombre}</h3>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                    <Users className="w-3.5 h-3.5 mr-1" />
                    Capacidad: {sala.capacidad} personas
                  </span>
                </div>

                <p className="mt-2 text-xs font-medium text-slate-500 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
                  {sala.ubicacion}
                </p>

                {sala.equipamiento && (
                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700 mb-1">Equipamiento:</p>
                    <p>{sala.equipamiento}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-medium flex items-center">
                  <Zap className="w-3.5 h-3.5 mr-1" /> Lista para reservar
                </span>
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold transition"
                >
                  Reservar Turno
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Integrity (RNF08) Callout */}
      <section className="w-full bg-slate-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <span className="text-indigo-400 font-semibold text-xs tracking-wider uppercase">
                Integridad y Reglas de Negocio (RNF08)
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Cero Conflictos de Horario con Verificación en Doble Capa
              </h2>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                Nuestra arquitectura previene que dos usuarios reserven la misma sala en rangos
                traslapados. Cuenta con validación matemática en el servidor de Next.js y un
                Trigger de integridad en PostgreSQL (Supabase) con políticas RLS de máxima seguridad.
              </p>
            </div>
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700">
              <div className="flex items-center space-x-3 mb-3 text-indigo-400">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-sm text-white">Regla de Traslape</span>
              </div>
              <code className="text-xs font-mono text-indigo-300 block bg-slate-950 p-3 rounded-lg overflow-x-auto">
                (hora_inicio &lt; existente.fin) <br />
                AND (hora_fin &gt; existente.inicio)
              </code>
              <p className="text-xs text-slate-400 mt-3">
                Cualquier reservación en conflicto es rechazada inmediatamente informando el motivo exacto.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
