-- ==============================================================================
-- SISTEMA DE RESERVACIÓN DE SALAS DE ESTUDIO DE BIBLIOTECA
-- Script de Base de Datos para Supabase (PostgreSQL + Auth + RLS)
-- ==============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA: profiles (Vinculada a auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre_completo TEXT NOT NULL,
    correo_institucional TEXT NOT NULL UNIQUE,
    rol TEXT NOT NULL DEFAULT 'estudiante' CHECK (rol IN ('estudiante', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Comentario descriptivo
COMMENT ON TABLE public.profiles IS 'Perfiles de usuarios (estudiantes y administradores) vinculados a la autenticación de Supabase.';

-- 3. TABLA: salas (Salas de estudio disponibles en la biblioteca)
CREATE TABLE IF NOT EXISTS public.salas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    capacidad INT NOT NULL CHECK (capacidad > 0),
    ubicacion TEXT NOT NULL,
    equipamiento TEXT,
    activa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.salas IS 'Salas de estudio con capacidad, ubicación física y equipamiento disponible.';

-- 4. TABLA: reservaciones (Gestión de turnos de reserva)
CREATE TABLE IF NOT EXISTS public.reservaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sala_id UUID NOT NULL REFERENCES public.salas(id) ON DELETE RESTRICT,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    motivo TEXT,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'finalizada', 'cancelada')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_horario_valido CHECK (hora_fin > hora_inicio)
);

COMMENT ON TABLE public.reservaciones IS 'Registro de reservaciones con validación estricta de horarios.';

-- Índices para optimizar consultas de traslape y filtros frecuentes
CREATE INDEX IF NOT EXISTS idx_reservaciones_traslape 
ON public.reservaciones (sala_id, fecha, hora_inicio, hora_fin) 
WHERE estado != 'cancelada';

CREATE INDEX IF NOT EXISTS idx_reservaciones_usuario 
ON public.reservaciones (usuario_id, fecha);

CREATE INDEX IF NOT EXISTS idx_reservaciones_fecha_estado 
ON public.reservaciones (fecha, estado);

-- ==============================================================================
-- 5. FUNCIÓN Y TRIGGER PARA INTEGRIDAD: PREVENCIÓN DE TRASLAPE DE HORARIOS (RNF08)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_reservation_overlap()
RETURNS TRIGGER 
LANGUAGE plpgsql
AS $$
BEGIN
    -- Solo verificar si la reservación no está cancelada
    IF NEW.estado != 'cancelada' THEN
        IF EXISTS (
            SELECT 1 
            FROM public.reservaciones
            WHERE sala_id = NEW.sala_id
              AND fecha = NEW.fecha
              AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
              AND estado != 'cancelada'
              -- Condición de solapamiento de intervalos temporales
              AND (NEW.hora_inicio < hora_fin AND NEW.hora_fin > hora_inicio)
        ) THEN
            RAISE EXCEPTION 'RNF08_OVERLAP: La sala seleccionada ya cuenta con una reservación activa en ese rango de horario para el día %.', NEW.fecha;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_reservation_overlap ON public.reservaciones;
CREATE TRIGGER trg_prevent_reservation_overlap
BEFORE INSERT OR UPDATE ON public.reservaciones
FOR EACH ROW
EXECUTE FUNCTION public.check_reservation_overlap();

-- ==============================================================================
-- 6. FUNCIÓN Y TRIGGER AUTOMÁTICO AL REGISTRARSE (auth.users -> public.profiles)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role TEXT := 'estudiante';
    full_name TEXT;
BEGIN
    -- Si en la metadata se especifica rol 'admin', asignarlo, de lo contrario 'estudiante'
    IF NEW.raw_user_meta_data->>'rol' IS NOT NULL AND NEW.raw_user_meta_data->>'rol' = 'admin' THEN
        user_role := 'admin';
    END IF;

    -- Extraer nombre completo o usar la parte local del correo
    full_name := COALESCE(
        NEW.raw_user_meta_data->>'nombre_completo',
        split_part(NEW.email, '@', 1)
    );

    INSERT INTO public.profiles (id, nombre_completo, correo_institucional, rol)
    VALUES (
        NEW.id,
        full_name,
        NEW.email,
        user_role
    )
    ON CONFLICT (id) DO UPDATE
    SET 
        nombre_completo = EXCLUDED.nombre_completo,
        correo_institucional = EXCLUDED.correo_institucional;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 7. FUNCIÓN HELPER PARA CONTROL DE ROLES (Evita recursión en RLS)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.profiles
        WHERE id = auth.uid() AND rol = 'admin'
    );
$$;

-- ==============================================================================
-- 8. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Habilitar RLS en las 3 tablas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservaciones ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- Políticas para: PROFILES
-- ------------------------------------------------------------------------------
-- Los usuarios pueden leer su propio perfil y los admins pueden leer todos los perfiles
CREATE POLICY "profiles_select_policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    id = auth.uid() OR public.is_admin()
);

-- Los usuarios pueden actualizar su propio perfil y los admins pueden actualizar cualquiera
CREATE POLICY "profiles_update_policy"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
    id = auth.uid() OR public.is_admin()
)
WITH CHECK (
    id = auth.uid() OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- Políticas para: SALAS
-- ------------------------------------------------------------------------------
-- Los usuarios autenticados pueden ver salas activas; los administradores pueden ver todas
CREATE POLICY "salas_select_policy"
ON public.salas
FOR SELECT
TO authenticated
USING (
    activa = true OR public.is_admin()
);

-- Solo administradores pueden insertar nuevas salas
CREATE POLICY "salas_insert_admin"
ON public.salas
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_admin()
);

-- Solo administradores pueden actualizar salas
CREATE POLICY "salas_update_admin"
ON public.salas
FOR UPDATE
TO authenticated
USING (
    public.is_admin()
)
WITH CHECK (
    public.is_admin()
);

-- Solo administradores pueden eliminar salas
CREATE POLICY "salas_delete_admin"
ON public.salas
FOR DELETE
TO authenticated
USING (
    public.is_admin()
);

-- ------------------------------------------------------------------------------
-- Políticas para: RESERVACIONES
-- ------------------------------------------------------------------------------
-- Los estudiantes pueden ver sus propias reservaciones; los administradores pueden ver todas
CREATE POLICY "reservaciones_select_policy"
ON public.reservaciones
FOR SELECT
TO authenticated
USING (
    usuario_id = auth.uid() OR public.is_admin()
);

-- Los estudiantes pueden crear reservaciones asociadas a su usuario_id; los admins para cualquiera
CREATE POLICY "reservaciones_insert_policy"
ON public.reservaciones
FOR INSERT
TO authenticated
WITH CHECK (
    (usuario_id = auth.uid()) OR public.is_admin()
);

-- Los estudiantes pueden editar sus propias reservaciones; los administradores pueden editar cualquiera
CREATE POLICY "reservaciones_update_policy"
ON public.reservaciones
FOR UPDATE
TO authenticated
USING (
    usuario_id = auth.uid() OR public.is_admin()
)
WITH CHECK (
    usuario_id = auth.uid() OR public.is_admin()
);

-- Los administradores pueden eliminar reservaciones; los estudiantes las cancelan mediante UPDATE de estado
CREATE POLICY "reservaciones_delete_policy"
ON public.reservaciones
FOR DELETE
TO authenticated
USING (
    usuario_id = auth.uid() OR public.is_admin()
);

-- ==============================================================================
-- 9. DATOS SEMILLA (4 Salas de Estudio por Defecto)
-- ==============================================================================
INSERT INTO public.salas (id, nombre, capacidad, ubicacion, equipamiento, activa)
VALUES 
    (
        '11111111-1111-1111-1111-111111111111',
        'Sala A - Silenciosa e Individual', 
        4, 
        'Piso 1 - Ala Norte (Zona de Silencio)', 
        '4 escritorios ergonómicos, lámparas LED individuales, tomas de corriente y conexión Ethernet.', 
        true
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'Sala B - Trabajo Colaborativo y Grupal', 
        8, 
        'Piso 1 - Ala Sur', 
        'Mesa redonda para 8 personas, pizarrón de cristal magnético con plumones y pantalla 55" HDMI.', 
        true
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Sala C - Multimedia y Videoconferencias', 
        6, 
        'Piso 2 - Centro de Medios', 
        'Cámara web gran angular 4K, micrófono ambiental de techo, Smart TV 65" y barra de sonido.', 
        true
    ),
    (
        '44444444-4444-4444-4444-444444444444',
        'Sala D - Tesis e Investigación Avanzada', 
        3, 
        'Piso 2 - Ala Poniente (Investigadores)', 
        'Pizarrón acrílico, sillones ejecutivos, monitor dual para laptops y aislamiento acústico.', 
        true
    )
ON CONFLICT (id) DO NOTHING;
