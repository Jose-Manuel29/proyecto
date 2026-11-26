# 📚 BiblioSalas - Sistema Web de Reservación de Salas de Estudio

Sistema full-stack moderno, responsivo y de alto rendimiento para la gestión y reservación de salas de estudio en bibliotecas universitarias. Desarrollado con **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Lucide Icons** y **Supabase (PostgreSQL + Auth + RLS)**, completamente optimizado para despliegue serverless unificado en **Vercel**.

---

## 🚀 Características Principales

- **Arquitectura Unificada Serverless:** Cero problemas de CORS o subdominios al desplegar Frontend, Server Actions y API Routes en un solo proyecto de Vercel.
- **Validación Estricta Anti-Traslapes (RNF08 - CRÍTICO):** Garantía matemática de no solapamiento de horarios en dos capas:
  1. En el servidor mediante **Next.js Server Actions** antes de insertar/actualizar.
  2. A nivel de base de datos con un **Trigger en PostgreSQL** (`check_reservation_overlap`).
- **Autenticación Institucional Segura (RF01, RF02, RF12):** Supabase Auth con soporte para restricción de dominios universitarios (`@universidad.edu`), sesiones gestionadas mediante cookies seguras en `@supabase/ssr` y Next.js Middleware.
- **CRUD Completo de Reservaciones (RF03, RF04, RF05, RF06):**
  - Reserva con selección de sala activa, fecha, hora inicio y fin.
  - Consulta de reservaciones propias en tiempo real.
  - Edición de fecha, horario o sala.
  - Cancelación segura con modal de confirmación y liberación instantánea de cupos.
- **Gestión Dinámica de Estados (RF09):** Transición entre `pendiente`, `confirmada`, `finalizada` y `cancelada`.
- **Filtros en Tiempo Real (RF10):** Filtrado instantáneo por sala, estado, fecha y búsqueda por motivo.
- **Dashboard Estadístico (RF11):** Métricas visuales de reservaciones pendientes, próximas (confirmadas), finalizadas y totales.
- **Panel Administrativo Protegido (RF13):**
  - Gestión integral de salas (crear, editar, activar/desactivar, capacidad y equipamiento).
  - Supervisión global de todas las reservaciones institucionales con cambio de estado.
  - Directorio de usuarios y asignación de roles (`estudiante` o `admin`).
- **Seguridad RLS (Row Level Security):** Políticas granulares en PostgreSQL para asegurar que los estudiantes solo accedan a sus propios datos mientras los administradores supervisan toda la biblioteca.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
| :--- | :--- |
| **Framework Full-Stack** | Next.js 14+ (App Router con Server Components y Server Actions) |
| **Lenguaje** | TypeScript |
| **Estilos y UI** | Tailwind CSS + Lucide React |
| **Base de Datos** | PostgreSQL (Supabase) con Triggers y RLS |
| **Autenticación** | Supabase Auth (`@supabase/ssr` + `@supabase/supabase-js`) |
| **Despliegue** | Vercel (Producción Zero-Config) |

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── actions/                  # Server Actions con lógica de negocio y validación RNF08
│   │   ├── reservations.ts       # CRUD y verificación matemática de traslapes
│   │   └── rooms.ts              # Creación, edición y activación de salas
│   ├── app/                      # Next.js App Router
│   │   ├── admin/                # Panel de control protegido para Administradores
│   │   ├── api/                  # API Routes (ej. /api/availability)
│   │   ├── dashboard/            # Dashboard principal de estudiantes
│   │   ├── login/                # Inicio de sesión institucional
│   │   ├── registro/             # Registro de estudiantes y administradores
│   │   ├── globals.css           # Estilos base de Tailwind CSS
│   │   ├── layout.tsx            # Layout global con sesión y Navbar
│   │   └── page.tsx              # Landing page informativa de la biblioteca
│   ├── components/               # Componentes UI reutilizables
│   │   ├── admin/                # Componentes interactivos del panel de admin
│   │   ├── dashboard/            # Tarjetas, modales y filtros del dashboard
│   │   └── Navbar.tsx            # Barra de navegación responsiva con logout seguro
│   ├── types/                    # Tipado TypeScript del modelo de base de datos
│   │   └── database.ts
│   ├── utils/                    # Clientes de Supabase y helpers
│   │   ├── supabase/
│   │   │   ├── client.ts         # Cliente navegador (@supabase/ssr)
│   │   │   ├── middleware.ts     # Manejador de cookies de sesión
│   │   │   └── server.ts         # Cliente servidor para Server Components/Actions
│   │   └── cn.ts                 # Utilidad para clases dinámicas con Tailwind
│   └── middleware.ts             # Protección perimetral de rutas (/dashboard, /admin)
├── supabase/
│   └── schema.sql                # Script SQL completo (Tablas, Triggers, RLS, Seed)
├── .env.example                  # Plantilla de variables de entorno
├── next.config.mjs               # Configuración de Next.js
├── tailwind.config.ts            # Configuración de Tailwind CSS
└── package.json                  # Dependencias y scripts
```

---

## 🗄️ Paso 1: Configurar Base de Datos en Supabase

1. Crea un proyecto en [Supabase](https://supabase.com/).
2. Dirígete a la sección **SQL Editor** en el menú lateral izquierdo.
3. Abre el archivo [`supabase/schema.sql`](supabase/schema.sql) de este repositorio.
4. Copia todo su contenido, pégalo en el editor SQL de Supabase y haz clic en **Run**.
5. Esto creará automáticamente:
   - Tabla `profiles` (vinculada con trigger a `auth.users`).
   - Tabla `salas` con 4 salas de ejemplo iniciales ya registradas.
   - Tabla `reservaciones` con índices y constraint de horario.
   - Trigger `trg_prevent_reservation_overlap` para la integridad anti-traslapes (RNF08).
   - Función de seguridad `is_admin()`.
   - Políticas de **Row Level Security (RLS)** para control de acceso estricto.

> [!TIP]
> **Configuración de Autenticación en Supabase:**
> Si deseas permitir registros y pruebas inmediatas sin esperar confirmación de correo electrónico:
> En tu panel de Supabase ve a **Authentication** > **Providers** > **Email** y desactiva la casilla **"Confirm email"**.

---

## ⚙️ Paso 2: Configurar Variables de Entorno Locales

1. Copia el archivo `.env.example` como `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Obtén tus credenciales en el panel de Supabase (**Project Settings** > **API**):
   - `Project URL` ➔ `NEXT_PUBLIC_SUPABASE_URL`
   - `anon / public key` ➔ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Ajusta las variables en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-de-supabase

   # Opcional: define un dominio institucional (ej. @universidad.edu) o déjalo vacío para permitir cualquier correo
   NEXT_PUBLIC_INSTITUTIONAL_EMAIL_DOMAIN=
   ```

---

## 💻 Paso 3: Ejecución en Desarrollo

1. Instala dependencias (si no lo has hecho):
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
3. Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## ☁️ Paso 4: Despliegue en Vercel

Este proyecto está 100% optimizado para la estructura nativa de Vercel (el archivo `package.json` está en la raíz).

1. Sube tu código a un repositorio en **GitHub**, **GitLab** o **Bitbucket**.
2. Entra a [Vercel](https://vercel.com/) y presiona **"Add New..."** > **"Project"**.
3. Importa el repositorio del proyecto.
4. En la sección **Environment Variables**, añade:
   - `NEXT_PUBLIC_SUPABASE_URL` con la URL de tu proyecto Supabase.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` con tu clave anónima de Supabase.
   - *(Opcional)* `NEXT_PUBLIC_INSTITUTIONAL_EMAIL_DOMAIN`.
5. Presiona **Deploy**. ¡Tu sistema estará en línea en menos de 2 minutos con SSL automático y CDN global!

---

## 🔒 Regla de Integridad Anti-Traslapes (RNF08)

El sistema implementa una estricta condición matemática de traslape de intervalos:

$$\text{Nuevo Inicio} < \text{Existente Fin} \quad \land \quad \text{Nuevo Fin} > \text{Existente Inicio}$$

Si un usuario intenta reservar una sala en un horario ya ocupado por otra reservación (que no esté cancelada), el sistema:
1. Lo detecta en la Server Action antes de interactuar con la base de datos y devuelve un mensaje descriptivo en la interfaz.
2. Si por concurrencia extrema ocurrieran peticiones simultáneas idénticas, el Trigger `check_reservation_overlap` de PostgreSQL aborta la transacción con una excepción segura, garantizando **cero conflictos y consistencia ACID total**.

---

## 👥 Roles del Sistema

- **Estudiante:**
  - Registro e inicio de sesión institucional.
  - Ver catálogo de salas activas.
  - Reservar salas de estudio.
  - Editar sus reservaciones (fecha, hora, sala).
  - Cambiar estado o cancelar con modal de advertencia y confirmación.
  - Filtros en tiempo real y métricas personales.

- **Administrador:**
  - Acceso al panel `/admin`.
  - Crear nuevas salas y editar información de las existentes.
  - Activar o desactivar salas temporalmente por mantenimiento.
  - Supervisar todas las reservaciones del campus y modificar su estado.
  - Visualizar la lista de usuarios registrados con sus roles.
