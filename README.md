# 🎵 Vibra Music

**MVP** de la web de la academia musical **Vibra Music**, situada en **Carmona (Sevilla)**. Ofrece clases particulares, masterclass de varios instrumentos y reservas de estudios de grabación.

Desplegada en producción: **https://vibramusicstudio.es**

## Índice

- [Información no técnica](#información-no-técnica)
- [Información técnica](#información-técnica)
  - [Stack tecnológico](#stack-tecnológico)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Rutas](#rutas)
  - [Autenticación y base de datos](#autenticación-y-base-de-datos)
  - [Sistema de diseño](#sistema-de-diseño)
- [Primeros pasos](#primeros-pasos)
- [Scripts disponibles](#scripts-disponibles)
- [Despliegue en Cloudflare Pages](#despliegue-en-cloudflare-pages)
- [Ramas del repositorio](#ramas-del-repositorio)
- [Licencia](#licencia)

---

## Información no técnica

Vibra Music es una academia de música en Carmona (Sevilla) que ofrece:

### 🎸 Clases particulares
Cursos personalizados de instrumento en tres modalidades:

| Curso | Instrumento | Modalidad | Profesor/a | Precio |
|---|---|---|---|---|
| Guitarra Clásica | Guitarra | Individual | Carlos Romero | 120 €/mes |
| Piano Jazz | Piano | Individual | María Fernández | 130 €/mes |
| Canto Pop / Rock | Canto | Individual | Laura Santos | 110 €/mes |
| Batería | Batería | Grupal | Diego Martínez | 80 €/mes |
| Bajo Eléctrico | Bajo | Online | Andrés López | 95 €/mes |
| Violín Clásico | Violín | Individual | Elena Castillo | 125 €/mes |

### 🎤 Masterclass
Formaciones intensivas de especialización:

| Masterclass | Instructor/a | Precio | Duración |
|---|---|---|---|
| Improvisación en Jazz | John Morales | 29 € | 4h 30min |
| Técnica Vocal Avanzada | Sarah Connor | 39 € | 3h 15min |
| Producción Musical desde Cero | Alex Beats | 49 € | 6h 00min |
| Guitarra Flamenca | Paco Reyes | 35 € | 3h 45min |
| Composición para Piano | Clara Novak | 45 € | 5h 00min |
| Percusión Afrobrasileña | Rafael Lima | 29 € | 3h 00min |

### 🎛️ Estudio de grabación
Espacio profesional con equipamiento de primer nivel:

- Consola Neve 8078 y SSL 4000 E/G
- Pro Tools HD y más de 100 micrófonos vintage
- Neumann U87 (×8), compresor API 2500
- Reverb Lexicon 480L y cinta de 2" Studer A820

La web incluye una landing con todas las secciones (hero, sobre nosotros, cursos, masterclass, demos de audio del estudio, estudio y contacto), registro e inicio de sesión reales, un **perfil** con las reservas y mensajes del usuario, y un **panel de administración** para gestionar reservas y mensajes.

> [!NOTE]
> **MVP**: el backend y la autenticación son reales (Supabase), pero el **contenido es ficticio** — catálogo de cursos/precios, imágenes (Unsplash), teléfono y dirección aún son placeholders a sustituir por datos reales. Email de contacto disponible: `support@vibramusicstudio.es`.

---

## Información técnica

### Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [Angular](https://angular.dev) | ^20.3.30 | Framework principal |
| [Angular CLI](https://github.com/angular/angular-cli) | ^20.3.35 | Herramientas de build (builder `@angular/build`) |
| [TypeScript](https://www.typescriptlang.org) | ~5.8.0 | Lenguaje |
| [SCSS](https://sass-lang.com) | — | Estilos (variables, mixins, globales) |
| [RxJS](https://rxjs.dev) | ~7.8.0 | Programación reactiva |
| [Supabase](https://supabase.com) | `@supabase/supabase-js` ^2.116.0 | Backend: auth, base de datos (PostgreSQL + RLS) |
| [Vitest](https://vitest.dev) | ^3.2.7 | Test runner (39 tests) |
| [Prettier](https://prettier.io) | ^3.8.1 | Formateo de código |

**Notas de arquitectura:**

- **Standalone components** sin NgModules, con **carga perezosa** (*lazy loading*) en todas las rutas.
- **Change detection zoneless** (`provideZonelessChangeDetection()`) usando **señales** (signals) de Angular en lugar de Zone.js.
- **Backend real** en Supabase: cliente compartido en `supabase.service.ts` y servicios `auth`, `booking`, `messages` y `admin`.

### Estructura del proyecto

```
src/
├── app/
│   ├── app.ts / app.html / app.scss       # Componente raíz
│   ├── app.config.ts                      # Providers (zoneless, router, http, supabase)
│   ├── app.routes.ts                      # Definición de rutas (lazy)
│   ├── core/
│   │   ├── data/                          # Datos ficticios de cursos, masterclass y estudio
│   │   ├── guards/                        # auth.guard.ts, admin.guard.ts
│   │   ├── models/                        # Interfaces (Course, Masterclass, Booking, Message...)
│   │   └── services/                      # supabase, auth, booking, messages, admin, theme, toast
│   ├── features/
│   │   ├── authentication/                # Páginas login y registro
│   │   ├── landing/
│   │   │   ├── pages/home/                # Página de aterrizaje
│   │   │   └── components/                # hero, about, courses, masterclasses, studio, contact, ...
│   │   ├── admin/                         # Panel de administración
│   │   ├── profile/                       # Perfil (protegido por guard)
│   │   └── not-found/                     # Página 404
│   └── shared/components/                 # button, card, header, footer, loading-spinner
├── assets/styles/                         # _variables.scss, _mixins.scss, _global.scss
└── environments/                          # URL y clave de Supabase (prod / dev)
supabase/
└── schema.sql                             # Esquema SQL (tablas, RLS, triggers, RPC)
scripts/
└── postbuild.mjs                          # Genera 404.html para el fallback SPA
```

### Rutas

| Ruta | Componente | Guard |
|---|---|---|
| `/` | Home (landing) | — |
| `/login` | Login | — |
| `/registro` | Registro | — |
| `/perfil` | Perfil | `authGuard` |
| `/admin` | Admin | `authGuard` + `adminGuard` |
| `**` | NotFound | — |

### Autenticación y base de datos

- **Auth real** con Supabase: registro + confirmación por email, login y cierre de sesión.
- Sesión **persistente** (`persistSession`, `autoRefreshToken`), enlace de confirmación redirigido a `/login` (`emailRedirectTo` + `detectSessionInUrl`).
- **Base de datos PostgreSQL** con **RLS** habilitado por tabla (`profiles`, `bookings`, `messages`).
- Usuarios **admin** marcados en el perfil (`is_admin` via RPC `security definer`, verificado en `adminGuard`).
- **Reservas compartidas** del estudio: franjas `(date, slot)` con restricción única (conflicto = código `23505`); la lectura de franjas ocupadas usa la RPC `get_booked_slots` (RLS impide leer reservas ajenas).
- El esquema completo (idempotente) está en `supabase/schema.sql`.

### Sistema de diseño

- **Fuente:** Afacad Flux (Google Fonts)
- **Color primario:** rojo `#e73938`
- **Fondo:** blanco cálido `#f6f5f2`
- Tema claro/oscuro seleccionable, con más de 100 variables de diseño en `_variables.scss`.
- Breakpoints responsive: 576 / 768 / 992 / 1200 px. Ancho máximo de contenedor: 1024 px.
- Estilos 100% SCSS propios, sin frameworks CSS externos.

---

## Primeros pasos

Requisitos: [Node.js](https://nodejs.org) (npm 11+) y un proyecto **Supabase**.

```bash
# Instalar dependencias (usa .npmrc con legacy-peer-deps)
npm install

# Configurar Supabase en src/environments/
#  environment.ts        -> producción
#  environment.development.ts -> desarrollo

# Ejecutar supabase/schema.sql en el SQL Editor de Supabase

# Arrancar servidor de desarrollo
npm start
# o
ng serve
```

Abre [http://localhost:4200/](http://localhost:4200/). La aplicación se recarga automáticamente al modificar el código.

> Para que la confirmación por email funcione, en Supabase → **Authentication → URL Configuration** el **Site URL** debe apuntar al origen de la web y los **Redirect URLs** permitir `/login`.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` / `ng serve` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` / `ng build` | Build de producción en `dist/` |
| `npm run postbuild` | Genera `dist/vibramusic/browser/404.html` (fallback SPA, lo ejecuta `build`) |
| `npm run watch` | Build en modo observación (desarrollo) |
| `npm test` / `ng test` | Ejecutar tests unitarios (Vitest, 39 tests) |
| `ng generate component <nombre>` | Generar componentes/schematics con Angular CLI |

## Despliegue en Cloudflare Pages

- Desplegado en **https://vibramusicstudio.es** (SSL automático) con Git integrado.
- **Rama de producción:** `dev` (cada push a `dev` lanza build y deploy).
- **Build command:** `npm run build` → salida en `dist/vibramusic/browser` (con `NODE_VERSION=22`).
- **Fallback SPA:** el `postbuild` copia el `index.html` como `404.html`, de modo que cualquier ruta (`/perfil`, `/admin`, …) sirve la app y el enrutado Angular la resuelve.
- **Dominio y DNS:** zona gestionada por Cloudflare; `www.vibramusicstudio.es` redirige con **301** a la raíz; email de contacto (`hola@vibramusicstudio.es`) mediante **Email Routing** gratuito.

## Ramas del repositorio

| Rama | Descripción |
|---|---|
| `main` | Rama raíz (histórica; producción desplegada desde `dev`) |
| `dev` | **Rama de producción** (la ve Cloudflare Pages) |
| `landing` | Trabajo activo de la landing (activa) |
| `Julio_Landing` | Rama remota con avances de Julio |

Flujo de trabajo: `landing` → `dev` → (deploy automático); los merges los realiza el responsable del repo.

## Licencia

[CC0 1.0 Universal](LICENSE) — dedicado al dominio público.
