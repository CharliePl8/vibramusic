# 🎵 Vibra Music

Web de la academia musical **Vibra Music**, situada en **Carmona (Sevilla)**. Ofrece una variedad de servicios como clases particulares, masterclass de varios instrumentos y reservas de estudios de grabación.

## Índice

- [Información no técnica](#información-no-técnica)
- [Información técnica](#información-técnica)
  - [Stack tecnológico](#stack-tecnológico)
  - [Estructura del proyecto](#estructura-del-proyecto)
  - [Rutas](#rutas)
  - [Sistema de diseño](#sistema-de-diseño)
  - [Autenticación](#autenticación)
- [Primeros pasos](#primeros-pasos)
- [Scripts disponibles](#scripts-disponibles)
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

La web incluye una página de aterrizaje con todas las secciones (hero, sobre nosotros, cursos, masterclass, demos de audio del estudio, estudio y contacto), además de un sistema de registro e inicio de sesión para acceder a un perfil personal.

> [!NOTE]
> Versión actual: las imágenes son de [Unsplash](https://unsplash.com), los usuarios se guardan localmente en el navegador y la autenticación es solo de demostración (sin backend). Todo el contenido es ficticio como prototipo funcional.

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
| [Vitest](https://vitest.dev) | configurado | Test runner (aún sin tests) |
| [Prettier](https://prettier.io) | ^3.8.1 | Formateo de código |

**Notas de arquitectura:**

- **Standalone components** sin NgModules, con **carga perezosa** (*lazy loading*) en todas las rutas.
- **Change detection zoneless** (`provideZonelessChangeDetection()`) usando **señales** (signals) de Angular en lugar de Zone.js.
- `provideHttpClient()` ya está registrado, preparado para un futuro backend (actualmente sin uso).

### Estructura del proyecto

```
src/
├── app/
│   ├── app.ts / app.html / app.scss       # Componente raíz
│   ├── app.config.ts                      # Providers (zoneless, router, http)
│   ├── app.routes.ts                      # Definición de rutas
│   ├── core/
│   │   ├── data/                          # Datos de cursos, masterclass y estudio
│   │   ├── guards/                        # auth.guard.ts
│   │   ├── models/                        # Interfaces (Course, Masterclass, User...)
│   │   └── services/                      # auth.service.ts
│   ├── features/
│   │   ├── authentication/                # Páginas login y registro
│   │   ├── landing/
│   │   │   ├── pages/home/                # Página de aterrizaje
│   │   │   └── components/                # hero, about, courses, masterclasses, studio, ...
│   │   └── profile/                       # Perfil (protegido por guard)
│   └── shared/components/                 # button, card, header, footer, loading-spinner
└── assets/styles/                         # _variables.scss, _mixins.scss, _global.scss
```

### Rutas

| Ruta | Componente | Guard |
|---|---|---|
| `/` | Home (landing) | — |
| `/login` | Login | — |
| `/registro` | Registro | — |
| `/perfil` | Perfil | `authGuard` |
| `**` | Redirige a `/` | — |

### Sistema de diseño

- **Fuente:** Afacad Flux (Google Fonts)
- **Color primario:** rojo `#e73938`
- **Fondo:** blanco cálido `#f6f5f2`
- **Tema claro** con más de 100 variables de diseño en `_variables.scss` (colores, tipografía, espaciado, breakpoints, sombras, z-index, radius).
- Breakpoints responsive: 576 / 768 / 992 / 1200 px. Ancho máximo de contenedor: 1024 px.
- Estilos 100% SCSS propios, sin frameworks CSS externos.

### Autenticación

- **Client-side exclusivamente** (sin backend ni llamadas HTTP reales).
- Usuarios persistidos en `localStorage`; sesión activa en `sessionStorage`.
- Las sesiones **expiran a los 10 minutos**.
- La contraseña se guarda con un hash simple (no criptográfico — **solo es una demo, no usar en producción**).
- El perfil (`/perfil`) está protegido por `authGuard` y redirige a `/login` si no hay sesión.

---

## Primeros pasos

Requisitos: [Node.js](https://nodejs.org) (npm 11+).

```bash
# Instalar dependencias
npm install

# Arrancar servidor de desarrollo
npm start
# o
ng serve
```

Abre [http://localhost:4200/](http://localhost:4200/). La aplicación se recarga automáticamente al modificar el código.

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` / `ng serve` | Servidor de desarrollo en `http://localhost:4200` |
| `npm run build` / `ng build` | Build de producción en `dist/` |
| `npm run watch` | Build en modo observación (desarrollo) |
| `npm test` / `ng test` | Ejecutar tests unitarios (Vitest, sin tests aún) |
| `ng generate component <nombre>` | Generar componentes/schematics con Angular CLI |

## Ramas del repositorio

| Rama | Descripción |
|---|---|
| `main` | Rama principal |
| `dev` | Desarrollo |
| `landing` | Trabajo sobre la landing page (activa) |
| `Julio_Landing` | Rama remota con avances de Julio |

## Licencia

[CC0 1.0 Universal](LICENSE) — dedicado al dominio público.