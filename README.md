[English](#english) - [Español](#espa%C3%B1ol)

---

## English

# Spotify Explorer

Spotify Explorer is a Next.js 14 app that connects to your Spotify account to explore your listening data, analyze playlists, and generate personalized mixes using the Spotify Web API.

## Features

### Authentication & Session

-   Spotify OAuth2 login flow with authorization code + refresh token.
-   Automatic access token refresh via internal API routes.
-   Client-side logout and session cleanup.

### Dashboard

Located at `/dashboard`:

-   Overview entry point to the rest of the app sections.
-   Shared layout with sidebar navigation and user panel.

### Playlist Management

Located under `/dashboard/playlists`:

-   **Playlists List** (`/dashboard/playlists`):
    -   Fetches and displays the user playlists from Spotify.
-   **Playlist Details** (`/dashboard/playlists/[id]`):
    -   Hero section with cover, name, description, owner, total tracks, and total duration.
    -   Link to open playlist directly in Spotify.
    -   Track list with:
        -   Track name, artists, album, duration, popularity badge.
        -   Ability to mark/unmark tracks as favorites (stored in `localStorage`).
    -   Playlist analytics:
        -   Top artists from the playlist.
        -   Top genres.
        -   Basic popularity stats (average, distribution buckets).
        -   Decade distribution of tracks.

### Mixer – Playlist Generator

Located at `/dashboard/mixer`:

-   **Selection phase**:
    -   `ArtistSelector`: search artists via Spotify API and select multiple.
    -   `TrackSelector`: search tracks and add them as hard constraints.
    -   `GenreSelector`: pick up to a limited number of Spotify genres.
    -   `DecadeSelector`: choose musical decades (1950s–2020s).
    -   `MoodSelector`: sliders for energy, valence, and danceability with presets (Party, Chill, Sad, Workout).
    -   `PopularitySelector`: presets for “Mainstream”, “Popular”, “Underground”, or full range.
-   **Generation logic** (`/lib/mixer.js`):
    -   Combines:
        -   Top tracks for selected artists.
        -   Tracks for selected genres.
        -   Explicitly selected tracks.
        -   Favorite tracks from `localStorage` (if available).
    -   Filters by:
        -   Decade (based on album release year).
        -   Popularity range.
    -   Deduplicates tracks, shuffles, and limits to a maximum size (e.g. 30 tracks).
-   **Results phase**:
    -   Generated playlist listing with cover, artists, duration, popularity.
    -   Remove individual tracks from the generated playlist.
    -   Mark tracks as favorites from the mixer UI.
    -   Buttons:
        -   **Generate Playlist** (initial generation from current preferences).
        -   **Regenerate** (same preferences, new recommendations).
        -   **Add More** (keeps current tracks and appends new, non-duplicate ones).
        -   **Save to Spotify** (creates a private playlist in the user account).
-   **Save Playlist Modal**:
    -   Custom modal to choose playlist name before saving.
    -   Default name suggestion with current date.
    -   Integrated with Spotify playlist creation API through `/lib/playlists.js`.

### Personal Library & Stats

Located under `/dashboard`:

-   **My Top** (`/dashboard/my-top`):
    -   Uses `/lib/user.js` to fetch top artists and top tracks for different time ranges.
    -   Can be used together with `/lib/stats.js` to compute:
        -   Top artists summary.
        -   Genre breakdown.
        -   Popularity distribution.
-   **Recent** (`/dashboard/recent`):
    -   Shows recently played tracks using `getRecentlyPlayed`.
-   **Saved** (`/dashboard/saved`):
    -   Lists user’s saved tracks using `getUserSavedTracks`.

### Favorites System

-   `hooks/useFavorites.js`:
    -   Stores favorite tracks in `localStorage`.
    -   Exposes:
        -   `favorites`
        -   `toggleFavorite(track)`
        -   `isFavorite(trackId)`
        -   `clearFavorites()`
    -   Used in:
        -   Mixer playlist view.
        -   Playlist details page.
    -   Favorites are optionally fed into the mixer generation logic as additional seed tracks.

### UI & Components

-   Glassmorphism visual style via `globals.css` and `.glass-card` utility.
-   Reusable widgets for analytics:
    -   `ArtistWidget`, `GenreWidget`, `DecadeWidget`, `MoodWidget`, `PopularityWidget`, `TracksListWidget`.
-   Shared layout with:
    -   `Sidebar` (navigation between dashboard sections).
    -   `UserPanel` (user info and logout).

## Project Structure

```text
spotify_explorer/
├── ecosystem.config.js
├── jsconfig.json
├── node_modules/
├── pnpm-lock.yaml
├── public/
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
└── src
    ├── app
    │   ├── api
    │   │   ├── refresh-token/
    │   │   │   └── route.js           # Refresh Spotify access token
    │   │   └── spotify-token/
    │   │       └── route.js           # Initial token exchange / auth helper
    │   ├── auth
    │   │   └── callback/
    │   │       ├── CallbackContent.jsx
    │   │       └── page.jsx           # OAuth callback handling
    │   ├── dashboard
    │   │   ├── layout.jsx             # Shared dashboard layout (sidebar, shell)
    │   │   ├── mixer/
    │   │   │   └── page.jsx           # Mixer UI and logic integration
    │   │   ├── my-top/
    │   │   │   └── page.jsx           # User top artists/tracks
    │   │   ├── page.jsx               # Dashboard home
    │   │   ├── playlists
    │   │   │   ├── [id]/
    │   │   │   │   └── page.jsx       # Playlist details + analytics
    │   │   │   └── page.jsx           # List of user playlists
    │   │   ├── recent/
    │   │   │   └── page.jsx           # Recently played tracks
    │   │   └── saved/
    │   │       └── page.jsx           # Saved tracks
    │   ├── favicon.ico
    │   ├── globals.css                # Global styles, glassmorphism, layout
    │   ├── layout.js                  # Root layout
    │   └── page.js                    # Landing / entry page
    ├── components
    │   ├── modals
    │   │   └── SavePlaylistModal.jsx  # Modal to name and confirm playlist save
    │   ├── selection-widgets
    │   │   ├── ArtistSelector.jsx
    │   │   ├── DecadeSelector.jsx
    │   │   ├── GenreSelector.jsx
    │   │   ├── MoodSelector.jsx
    │   │   ├── PopularitySelector.jsx
    │   │   └── TrackSelector.jsx
    │   ├── Sidebar.jsx
    │   ├── UserPanel.jsx
    │   └── widgets
    │       ├── ArtistWidget.jsx
    │       ├── DecadeWidget.jsx
    │       ├── GenreWidget.jsx
    │       ├── MoodWidget.jsx
    │       ├── PopularityWidget.jsx
    │       └── TracksListWidget.jsx
    ├── hooks
    │   └── useFavorites.js            # Favorites management hook (localStorage)
    └── lib
        ├── api.js                     # Generic Spotify fetch helpers
        ├── auth.js                    # Token storage, refresh, and auth utilities
        ├── clientAuth.js              # Client-side logout hook
        ├── index.js                   # Barrel export for lib modules
        ├── mixer.js                   # Playlist generation engine
        ├── playlists.js               # Playlist CRUD helpers
        ├── stats.js                   # Track-based stats & aggregations
        ├── tracks.js                  # Track/artist/audio-features helpers
        └── user.js                    # User profile and library endpoints
```

## Tech Stack

-   **Framework**: Next.js 14 (App Router)
-   **Language**: JavaScript (React client components)
-   **Styling**: Tailwind-like utility classes + custom CSS
-   **Auth & API**: Spotify Web API (OAuth2, access/refresh tokens)
-   **State & UX**:
    -   React hooks (`useState`, `useEffect`)
    -   Custom hooks (`useFavorites`)
    -   Toast notifications (`react-hot-toast`)
-   **Package Manager**: pnpm

---

## Español

# Spotify Explorer

Spotify Explorer es una aplicación Next.js 14 que se conecta a tu cuenta de Spotify para explorar tus datos de escucha, analizar playlists y generar mezclas personalizadas usando la API Web de Spotify.

## Funcionalidades

### Autenticación y Sesión

-   Login con OAuth2 de Spotify usando código de autorización + refresh token.
-   Refresco automático del access token mediante rutas API internas.
-   Logout en cliente y limpieza completa de sesión.

### Dashboard

Ubicado en `/dashboard`:

-   Punto de entrada a las diferentes secciones de la app.
-   Layout compartido con sidebar de navegación y panel de usuario.

### Gestión de Playlists

Ubicado en `/dashboard/playlists`:

-   **Listado de playlists** (`/dashboard/playlists`):
    -   Obtiene y muestra las playlists del usuario desde Spotify.
-   **Detalle de playlist** (`/dashboard/playlists/[id]`):
    -   Sección principal (hero) con portada, nombre, descripción, propietario, número de canciones y duración total.
    -   Enlace para abrir la playlist directamente en Spotify.
    -   Lista de canciones con:
        -   Nombre, artistas, álbum, duración, badge de popularidad.
        -   Marcar/desmarcar canciones como favoritas (guardadas en `localStorage`).
    -   Analítica de la playlist:
        -   Top artistas de la playlist.
        -   Géneros principales.
        -   Estadísticas de popularidad (media, distribución).
        -   Distribución por décadas de lanzamiento.

### Mixer – Generador de Playlists

Ubicado en `/dashboard/mixer`:

-   **Fase de selección**:
    -   `ArtistSelector`: búsqueda de artistas vía API de Spotify y selección múltiple.
    -   `TrackSelector`: búsqueda de canciones y selección como restricciones fuertes.
    -   `GenreSelector`: selección de varios géneros de Spotify.
    -   `DecadeSelector`: elección de décadas musicales (1950s–2020s).
    -   `MoodSelector`: sliders de energía, positividad y bailabilidad con presets (Fiesta, Chill, Triste, Workout).
    -   `PopularitySelector`: presets para “Mainstream”, “Popular”, “Underground” o sin filtro.
-   **Lógica de generación** (`/lib/mixer.js`):
    -   Combina:
        -   Top tracks de los artistas seleccionados.
        -   Canciones encontradas por género.
        -   Canciones seleccionadas manualmente.
        -   Canciones favoritas desde `localStorage` (si existen).
    -   Filtra por:
        -   Décadas (a partir del año de lanzamiento del álbum).
        -   Rango de popularidad.
    -   Elimina duplicados, baraja el orden y limita el tamaño máximo (por ejemplo, 30 canciones).
-   **Fase de resultados**:
    -   Lista de la playlist generada con portada, artistas, duración y popularidad.
    -   Eliminación individual de canciones de la playlist generada.
    -   Marcar canciones como favoritas desde la propia vista del mixer.
    -   Botones:
        -   **Generar Playlist** (generación inicial a partir de las preferencias actuales).
        -   **Regenerar** (mismas preferencias, nuevas recomendaciones).
        -   **Añadir Más** (mantiene las canciones actuales y añade nuevas, sin duplicados).
        -   **Guardar en Spotify** (crea una playlist privada en la cuenta del usuario).
-   **Modal de guardado de playlist**:
    -   Modal personalizado para elegir el nombre de la playlist antes de guardarla.
    -   Sugiere un nombre por defecto con la fecha actual.
    -   Integrado con la API de creación de playlists mediante `/lib/playlists.js`.

### Biblioteca Personal y Estadísticas

Ubicado bajo `/dashboard`:

-   **My Top** (`/dashboard/my-top`):
    -   Usa `/lib/user.js` para obtener artistas y canciones más escuchados según rango temporal.
    -   Puede combinarse con `/lib/stats.js` para:
        -   Resumen de artistas principales.
        -   Distribución de géneros.
        -   Distribución de popularidad.
-   **Recent** (`/dashboard/recent`):
    -   Muestra las canciones reproducidas recientemente mediante `getRecentlyPlayed`.
-   **Saved** (`/dashboard/saved`):
    -   Lista las canciones guardadas del usuario mediante `getUserSavedTracks`.

### Sistema de Favoritos

-   `hooks/useFavorites.js`:
    -   Almacena canciones favoritas en `localStorage`.
    -   Expone:
        -   `favorites`
        -   `toggleFavorite(track)`
        -   `isFavorite(trackId)`
        -   `clearFavorites()`
    -   Usado en:
        -   Vista de playlist generada en el mixer.
        -   Página de detalle de playlist.
    -   Los favoritos se usan opcionalmente como seeds adicionales en la generación de playlists.

### UI y Componentes

-   Estilo visual tipo glassmorphism definido en `globals.css` y la utilidad `.glass-card`.
-   Widgets reutilizables de analítica:
    -   `ArtistWidget`, `GenreWidget`, `DecadeWidget`, `MoodWidget`, `PopularityWidget`, `TracksListWidget`.
-   Layout compartido con:
    -   `Sidebar` (navegación entre secciones del dashboard).
    -   `UserPanel` (información de usuario y logout).

## Estructura del Proyecto

```text
spotify_explorer/
├── ecosystem.config.js
├── jsconfig.json
├── node_modules/
├── pnpm-lock.yaml
├── public/
├── eslint.config.mjs
├── next.config.mjs
├── package.json
├── postcss.config.mjs
├── README.md
└── src
    ├── app
    │   ├── api
    │   │   ├── refresh-token/
    │   │   │   └── route.js           # Refresco del access token de Spotify
    │   │   └── spotify-token/
    │   │       └── route.js           # Intercambio inicial de tokens / ayuda de auth
    │   ├── auth
    │   │   └── callback/
    │   │       ├── CallbackContent.jsx
    │   │       └── page.jsx           # Gestión del callback OAuth
    │   ├── dashboard
    │   │   ├── layout.jsx             # Layout común del dashboard (sidebar, shell)
    │   │   ├── mixer/
    │   │   │   └── page.jsx           # UI del mixer y lógica de integración
    │   │   ├── my-top/
    │   │   │   └── page.jsx           # Top artistas/canciones del usuario
    │   │   ├── page.jsx               # Home del dashboard
    │   │   ├── playlists
    │   │   │   ├── [id]/
    │   │   │   │   └── page.jsx       # Detalle de playlist + analítica
    │   │   │   └── page.jsx           # Listado de playlists del usuario
    │   │   ├── recent/
    │   │   │   └── page.jsx           # Canciones recientes
    │   │   └── saved/
    │   │       └── page.jsx           # Canciones guardadas
    │   ├── favicon.ico
    │   ├── globals.css                # Estilos globales, glassmorphism, layout
    │   ├── layout.js                  # Layout raíz
    │   └── page.js                    # Landing / página de entrada
    ├── components
    │   ├── modals
    │   │   └── SavePlaylistModal.jsx  # Modal para nombrar y confirmar guardado
    │   ├── selection-widgets
    │   │   ├── ArtistSelector.jsx
    │   │   ├── DecadeSelector.jsx
    │   │   ├── GenreSelector.jsx
    │   │   ├── MoodSelector.jsx
    │   │   ├── PopularitySelector.jsx
    │   │   └── TrackSelector.jsx
    │   ├── Sidebar.jsx
    │   ├── UserPanel.jsx
    │   └── widgets
    │       ├── ArtistWidget.jsx
    │       ├── DecadeWidget.jsx
    │       ├── GenreWidget.jsx
    │       ├── MoodWidget.jsx
    │       ├── PopularityWidget.jsx
    │       └── TracksListWidget.jsx
    ├── hooks
    │   └── useFavorites.js            # Hook para gestionar favoritos (localStorage)
    └── lib
        ├── api.js                     # Helpers genéricos para llamadas a Spotify
        ├── auth.js                    # Gestión de tokens, refresh y utilidades de auth
        ├── clientAuth.js              # Hook de logout en cliente
        ├── index.js                   # Barrel export de los módulos de lib
        ├── mixer.js                   # Motor de generación de playlists
        ├── playlists.js               # Helpers para gestionar playlists
        ├── stats.js                   # Estadísticas y agregaciones basadas en tracks
        ├── tracks.js                  # Helpers para tracks/artistas/audio-features
        └── user.js                    # Endpoints de perfil y biblioteca de usuario
```
