# Manual de JavaScript - Sitio Cat-Not-Furry

Este documento describe el funcionamiento de todos los archivos JavaScript del proyecto para facilitar la edición y el mantenimiento del sitio.

---

## Índice

1. [Arquitectura general](#1-arquitectura-general)
2. [Mapa de archivos y dependencias](#2-mapa-de-archivos-y-dependencias)
3. [Archivos por página](#3-archivos-por-página)
4. [Módulos en detalle](#4-módulos-en-detalle)
5. [Estructura de datos](#5-estructura-de-datos)
6. [Guía de edición rápida](#6-guía-de-edición-rápida)
7. [Flujo de carga](#7-flujo-de-carga)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Arquitectura general

El sitio es estático (HTML, CSS, JS vanilla) sin herramientas de build. Usa **ES Modules** (`import`/`export`). Los scripts se cargan con `type="module"`.

```
web-site/
├── index.html          → Carga js/main.js
├── proyectos-simple.html → Carga js/editor.js (editor de proyectos)
├── pages/
│   ├── about.html      → Carga js/main.js
│   ├── contact.html    → Carga js/main.js
│   ├── contribute.html  → Carga js/main.js
│   └── proyecto.html   → Carga js/main.js (página individual por proyecto)
├── js/
│   ├── main.js         → Orquestador principal (páginas públicas)
│   ├── editor.js       → Lógica del editor (proyectos-simple.html)
│   └── modules/
│       ├── components.js    → Header y footer
│       ├── data-loader.js   → Carga y render de proyectos
│       ├── project-filter.js → Filtro por categoría
│       ├── scroll-reveal.js  → Animación al hacer scroll
│       ├── theme-toggle.js   → Modo oscuro/claro
│       ├── project-detail.js  → Página individual de proyecto
│       ├── analytics.js      → GoatCounter (solo en producción)
│       └── icons.js          → Iconos SVG por nombre
├── data/
│   └── projects.json   → Fuente de datos de proyectos
├── templates/
│   ├── header.html
│   └── footer.html
└── scripts/
    └── update-projects.js   → Script Node para copiar JSON
```

---

## 2. Mapa de archivos y dependencias

```
main.js
├── components.js      (loadHeaderFooter)
├── data-loader.js     (loadProjects) → icons.js
├── project-filter.js  (initProjectFilter)
├── scroll-reveal.js   (initScrollReveal)
├── theme-toggle.js    (initThemeToggle)
├── project-detail.js  (loadProjectDetail) → icons.js
└── analytics.js       (loadAnalytics)

editor.js
├── theme-toggle.js
└── icons.js
```

---

## 3. Archivos por página

| Página | Script principal | Módulos usados |
|-------|------------------|----------------|
| index.html | main.js | components, data-loader, project-filter, scroll-reveal, theme-toggle, analytics |
| pages/about.html | main.js | components, theme-toggle, analytics |
| pages/contact.html | main.js | components, theme-toggle, analytics |
| pages/contribute.html | main.js | components, theme-toggle, analytics |
| pages/proyecto.html | main.js | components, theme-toggle, project-detail, analytics |
| proyectos-simple.html | editor.js | theme-toggle, icons |

---

## 4. Módulos en detalle

### 4.1 `js/main.js`

**Propósito**: Punto de entrada para las páginas públicas. Orquesta la carga de componentes y módulos según los elementos presentes en el DOM.

**Flujo**:
1. `DOMContentLoaded` → `loadHeaderFooter()` (carga header y footer)
2. `initThemeToggle()` (aplica tema guardado y enlaza el botón)
3. Si existe `#projects-container` → `loadProjects()`, `initProjectFilter()`, `initScrollReveal()`
4. Si existe `#project-detail` → `loadProjectDetail('project-detail')`
5. `highlightActiveLink()` (resalta el enlace activo en la navegación)

**Ediciones comunes**:
- Añadir un nuevo módulo: importar y llamar su función en el bloque correspondiente.
- Cambiar el orden de carga: modificar la secuencia dentro del `DOMContentLoaded`.

---

### 4.2 `js/modules/components.js`

**Propósito**: Cargar el header y el footer desde templates vía `fetch`.

**Funciones**:
- `loadHeaderFooter()`: Hace fetch de `templates/header.html` y `templates/footer.html`, los inserta en `#header` y `#footer`.

**Rutas**: Usa `base` según la ruta actual:
- En `/pages/*` → `base = '../'` (sube un nivel)
- En raíz → `base = ''`

**Ediciones comunes**:
- Cambiar nombres de templates: modificar las URLs en el fetch.
- Añadir más componentes: crear nuevos fetch e insertar en el DOM.

---

### 4.3 `js/modules/data-loader.js`

**Propósito**: Cargar `data/projects.json`, aplicar caché en localStorage y renderizar las tarjetas de proyectos en `#projects-container`.

**Constantes**:
- `CACHE_KEY`: `'projects_cache'`
- `CACHE_TTL`: 24 horas (en ms)

**Funciones principales**:
- `loadProjects()`: Lógica principal de carga (caché, fetch, render).
- `createProjectCard(project)`: Genera el HTML de cada tarjeta.
- `getProjectDetailUrl(project)`: Devuelve la URL de la página del proyecto (`pages/proyecto.html?id=...`).
- `renderProjects(container, projects)`: Vacía el contenedor y añade las tarjetas.
- `formatTimeAgo(ms)`: Formatea "hace X min/h/días" para el indicador de actualización.

**Caché**:
- Si hay caché válido (< 24h): muestra datos en caché y hace fetch en segundo plano para actualizar.
- Si no hay caché o falla: fetch normal.

**Elementos HTML esperados**:
- `#projects-container`: contenedor de tarjetas
- `#projects-updated`: texto opcional "Actualizado hace X"

**Ediciones comunes**:
- Cambiar tiempo de caché: modificar `CACHE_TTL`.
- Cambiar estructura de la tarjeta: editar el template en `createProjectCard()`.
- Añadir campos al proyecto: incluir el campo en el template y en `projects.json`.

---

### 4.4 `js/modules/project-filter.js`

**Propósito**: Filtro por categoría (Todos, Gaming, Dev) sin recargar la página.

**Funciones**:
- `initProjectFilter()`: Añade listeners a los botones `.filter-btn`.

**Comportamiento**:
- Cada botón tiene `data-category="all"`, `"gaming"` o `"dev"`.
- Al hacer clic: quita `active` de todos, añade `active` al pulsado.
- Muestra/oculta tarjetas según `project-card--${category}`.

**HTML esperado**:
```html
<button class="filter-btn btn btn--tech active" data-category="all">Todos</button>
<button class="filter-btn btn btn--tech" data-category="gaming">Gaming</button>
<button class="filter-btn btn btn--tech" data-category="dev">Dev</button>
```

**Ediciones comunes**:
- Añadir categoría: crear botón con `data-category="nueva"` y asegurar que las tarjetas tengan `project-card--nueva`.

---

### 4.5 `js/modules/scroll-reveal.js`

**Propósito**: Animación de entrada al hacer scroll (opacity + translateY).

**Funciones**:
- `initScrollReveal()`: Crea un `IntersectionObserver` que observa `.project-card` y `.testimonial-card`.
- Cuando el elemento entra en viewport: añade `project-card--visible` y `testimonial-card--visible`.

**Opciones del observer**:
- `threshold: 0.1`: 10% visible para disparar
- `rootMargin: '0px 0px -50px 0px'`: reduce el área efectiva por abajo

**CSS asociado** (en main.css):
- Estado inicial: `opacity: 0; transform: translateY(20px)`
- Visible: `opacity: 1; transform: translateY(0)`

**Ediciones comunes**:
- Cambiar sensibilidad: ajustar `threshold` o `rootMargin`.
- Añadir más elementos: incluir su selector en el query y las clases en el callback.

---

### 4.6 `js/modules/theme-toggle.js`

**Propósito**: Alternar entre tema oscuro y claro, guardando la preferencia en localStorage.

**Constantes**:
- `THEME_KEY`: `'theme'`
- `THEME_DARK`: `'dark'`
- `THEME_LIGHT`: `'light'`

**Funciones**:
- `initThemeToggle()`: Aplica tema guardado o `prefers-color-scheme`, enlaza el botón.
- `applyTheme(theme)`: Establece `data-theme="light"` en `<html>` (o vacío para oscuro), guarda en localStorage, actualiza iconos.
- `toggleTheme()`: Alterna entre light y dark.
- `getPreferredTheme()`: Devuelve tema guardado o el del sistema.

**HTML esperado**:
- Botón `#theme-toggle` con iconos `.theme-toggle__icon-sun` y `.theme-toggle__icon-moon`.

**CSS**: Las variables para tema claro están en `[data-theme="light"]` en main.css.

**Ediciones comunes**:
- Cambiar clave de localStorage: modificar `THEME_KEY`.
- Añadir más temas: extender la lógica y las variables CSS.

---

### 4.7 `js/modules/project-detail.js`

**Propósito**: Cargar y mostrar la página individual de un proyecto (`pages/proyecto.html?id=...`).

**Funciones**:
- `loadProjectDetail(containerId, projectId?)`: Lee `?id=` de la URL (o usa `projectId`), carga `projects.json`, busca el proyecto y lo renderiza.
- `renderProjectDetail(project)`: Genera el HTML del detalle.
- `renderNotFound()`: Mensaje cuando el proyecto no existe.
- `updateMetaTags(project)`: Actualiza `document.title` y meta tags (description, og:*, twitter:*).

**Elementos esperados**:
- `#project-detail`: contenedor donde se inserta el contenido.

**Ediciones comunes**:
- Cambiar diseño del detalle: editar el template en `renderProjectDetail()`.
- Añadir campos: incluir en el template y en `projects.json`.
- Cambiar enlace "Volver": modificar el `href` en `renderProjectDetail()` y `renderNotFound()`.

---

### 4.8 `js/modules/analytics.js`

**Propósito**: Cargar GoatCounter solo en producción. No se carga en localhost para evitar `ERR_BLOCKED_BY_CLIENT` durante el desarrollo.

**Constantes**:
- `GOATCOUNTER_CODE`: Sustituir `YOUR_GOATCOUNTER_CODE` por el código de [goatcounter.com](https://goatcounter.com).

**Funciones**:
- `loadAnalytics()`: Si no es localhost y el código está configurado, inyecta el script de GoatCounter.

**Nota**: En producción, visitantes con bloqueador de anuncios pueden ver `ERR_BLOCKED_BY_CLIENT` en su consola. El sitio funciona igual; solo no se registra la visita.

**Ediciones comunes**:
- Configurar analytics: editar `GOATCOUNTER_CODE` en `analytics.js`.
- Desactivar analytics: comentar `loadAnalytics()` en `main.js`.

---

### 4.9 `js/modules/icons.js`

**Propósito**: Proporcionar iconos SVG inline por nombre (estilo Lucide, MIT).

**Iconos disponibles**: `gamepad-2`, `terminal`, `cpu`, `code`, `box`, `monitor`

**Funciones**:
- `getIconHtml(iconName)`: Devuelve el HTML del icono o cadena vacía si no existe.
- `getAvailableIcons()`: Devuelve la lista de nombres disponibles.

**Añadir un icono**:
1. Obtener el SVG (path) del icono en [Lucide](https://lucide.dev) o similar.
2. Añadir entrada en `ICON_SVGS`:
```javascript
'mi-icono': '<path d="..."/>',
```
3. Usar en `projects.json`: `"icon": "mi-icono"`.
4. En el editor, añadir opción en el `<select id="icon">`.

---

### 4.10 `js/editor.js`

**Propósito**: Lógica completa del editor de proyectos (`proyectos-simple.html`). Permite importar, añadir, editar, eliminar y exportar proyectos.

**Elementos del DOM**:
- `#projects-container`: grid de tarjetas editables
- `#project-form`: formulario de añadir/editar
- `#preview-card-wrapper`: vista previa en tiempo real
- `#import-json`: textarea para pegar JSON
- `#json-output`: salida del JSON generado
- `#btn-import`, `#btn-export`, `#btn-copy`, `#btn-download`, `#btn-copy-command`, `#btn-submit`, `#btn-cancel-edit`

**Funciones principales**:
- `createCard(project)`: Crea tarjeta con botones Editar/Eliminar.
- `createPreviewCard(project)`: Crea tarjeta sin botones (vista previa).
- `buildCardHTML(project, withActions)`: Genera el HTML reutilizable.
- `getProjectFromForm()`: Lee los valores del formulario y devuelve un objeto proyecto.
- `updatePreview()`: Actualiza la vista previa con los datos del formulario.
- `fillForm(project)`: Rellena el formulario para editar.
- `cardsToJson()`: Extrae los proyectos de las tarjetas (desde `data-project`).
- `exportJson()`: Serializa a JSON y lo muestra en el textarea.

**Flujo de edición**:
1. Clic en "Editar" → `setEditMode(card)` → rellena formulario.
2. Clic en "Actualizar" → reemplaza tarjeta y cancela edición.
3. Clic en "Eliminar" → elimina tarjeta.
4. Submit del formulario (modo añadir) → crea nueva tarjeta.

**Vista previa**: Se actualiza en cada `input` y `change` del formulario.

**Exportación**:
1. "Generar JSON" → escribe en el textarea.
2. "Copiar JSON" → copia al portapapeles.
3. "Descargar" → descarga `projects.json`.
4. "Copiar comando" → copia `node scripts/update-projects.js ~/Downloads/projects.json`.

**Ediciones comunes**:
- Añadir campo al formulario: input en HTML, lectura en `getProjectFromForm()`, inclusión en `buildCardHTML()`.
- Cambiar estructura de la tarjeta: modificar `buildCardHTML()`.

---

### 4.11 `scripts/update-projects.js`

**Propósito**: Script Node.js para copiar un archivo JSON descargado a `data/projects.json`.

**Uso**:
```bash
node scripts/update-projects.js [ruta-origen]
```
- Sin argumentos: usa `./projects.json` en la raíz del proyecto.
- Con argumento: usa la ruta indicada (ej. `~/Downloads/projects.json`).

**Comportamiento**:
- Valida que el archivo exista y sea JSON válido.
- Copia el contenido a `data/projects.json`.
- Sale con error si el archivo no existe o el JSON es inválido.

---

## 5. Estructura de datos

### 5.1 `data/projects.json`

Cada proyecto es un objeto con esta estructura:

```json
{
  "id": "hud-overlay",
  "titulo": "hud_overlay",
  "icon": "gamepad-2",
  "category": "gaming",
  "subtitulo": "Fightstick Visualizer",
  "descripcion": "Descripción del proyecto...",
  "color": "#ff3b9d",
  "tecnologias": ["Python", "Pygame", "Linux"],
  "caracteristicas": ["Característica 1", "Característica 2"],
  "enlaces": {
    "repo": "https://github.com/...",
    "docs": "https://github.com/.../wiki"
  }
}
```

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| id | string | Recomendado | Identificador único. Se usa en la URL de la página del proyecto. Si falta, se genera desde `titulo`. |
| titulo | string | Sí | Nombre del proyecto. |
| icon | string | No | Nombre del icono (ver icons.js). Valores: gamepad-2, terminal, cpu, code, box, monitor. |
| category | string | Sí | `gaming` o `dev`. Define estilos y filtro. |
| subtitulo | string | Sí | Subtítulo breve. |
| descripcion | string | Sí | Descripción del proyecto. |
| color | string | No | Color del borde (hex). Por defecto #8A4AF3. |
| tecnologias | array | Sí | Lista de tecnologías (tags). |
| caracteristicas | array | Sí | Lista de características (viñetas). |
| enlaces.repo | string | Sí | URL del repositorio. |
| enlaces.docs | string | No | URL de documentación (wiki, etc.). También se acepta `enlaces.wiki`. |

### 5.2 Añadir un proyecto

1. Abrir `proyectos-simple.html` en el navegador.
2. Rellenar el formulario o pegar JSON en "Importar desde JSON".
3. Clic en "Descargar projects.json".
4. En la terminal, en la raíz del proyecto:
   ```bash
   node scripts/update-projects.js ~/Downloads/projects.json
   ```
5. Verificar que `data/projects.json` se haya actualizado.

---

## 6. Guía de edición rápida

### Cambiar el tiempo de caché de proyectos

En `js/modules/data-loader.js`:
```javascript
const CACHE_TTL = 24 * 60 * 60 * 1000;  // 24 horas
// Para 1 hora: 60 * 60 * 1000
// Para 1 semana: 7 * 24 * 60 * 60 * 1000
```

### Añadir un nuevo icono

1. En `js/modules/icons.js`, añadir en `ICON_SVGS`:
```javascript
'mi-icono': '<path d="..."/>',
```
2. En `data/projects.json`, usar `"icon": "mi-icono"`.
3. En `proyectos-simple.html`, añadir en el select:
```html
<option value="mi-icono">mi-icono</option>
```

### Añadir un campo al proyecto

1. En `data/projects.json`, añadir el campo a cada proyecto.
2. En `data-loader.js`, en `createProjectCard()`, incluir el campo en el template.
3. En `project-detail.js`, en `renderProjectDetail()`, incluir el campo.
4. En `editor.js`: añadir input en el formulario, leer en `getProjectFromForm()`, incluir en `buildCardHTML()`.

### Añadir una categoría al filtro

1. En `index.html`, añadir botón:
```html
<button class="filter-btn btn btn--tech" data-category="nueva">Nueva</button>
```
2. En `data/projects.json`, usar `"category": "nueva"` en los proyectos.
3. En `css/main.css`, añadir estilos para `.project-card--nueva` si hace falta.

### Cambiar el enlace "Volver a proyectos"

En `js/modules/project-detail.js`, en `renderProjectDetail()` y `renderNotFound()`:
```javascript
<a href="../index.html#proyectos" class="btn btn--tech">Volver a proyectos</a>
```
Ajustar `href` según la estructura de URLs del sitio.

### Desactivar el tema claro/oscuro

En `js/main.js`, comentar o eliminar:
```javascript
initThemeToggle();
```
Y en `templates/header.html` y `proyectos-simple.html`, eliminar el botón del tema.

---

## 7. Flujo de carga

### Página principal (index.html)

```
1. DOMContentLoaded
2. loadHeaderFooter() → fetch header.html, footer.html → insertar en #header, #footer
3. initThemeToggle() → leer localStorage/prefers-color-scheme → aplicar tema
4. loadProjects() → leer caché o fetch projects.json → renderProjects() → createProjectCard() por cada proyecto
5. initProjectFilter() → listeners en .filter-btn
6. initScrollReveal() → IntersectionObserver en .project-card, .testimonial-card
7. highlightActiveLink() → marcar enlace activo en nav
```

### Página de proyecto (pages/proyecto.html?id=X)

```
1. DOMContentLoaded
2. loadHeaderFooter()
3. initThemeToggle()
4. loadProjectDetail('project-detail') → leer ?id= → fetch projects.json → buscar proyecto → renderProjectDetail() → updateMetaTags()
5. highlightActiveLink()
```

### Editor (proyectos-simple.html)

```
1. Carga de editor.js
2. initThemeToggle()
3. fetch('data/projects.json') → createCard() por cada proyecto → appendChild
4. updatePreview() → vista previa inicial
5. Listeners: input/change en formulario → updatePreview()
6. Listeners: submit, click en Editar/Eliminar, Import, Export, Copy, Download
```

---

## 8. Troubleshooting

### Las tarjetas no se muestran

- Comprobar que existe `#projects-container` en el HTML.
- Comprobar que `data/projects.json` es JSON válido y tiene estructura de array.
- Revisar la consola del navegador por errores de fetch (CORS, 404).
- Si usas `file://`, el fetch puede fallar; usar un servidor local (ej. `python -m http.server 8080`).

### El header/footer no aparece

- Comprobar que existen `#header` y `#footer` en el HTML.
- Comprobar que `templates/header.html` y `templates/footer.html` existen.
- Revisar la ruta `base` (en `/pages/` debe ser `../`).

### El filtro no funciona

- Comprobar que los botones tienen `data-category` y la clase `filter-btn`.
- Comprobar que las tarjetas tienen `project-card--gaming` o `project-card--dev` según corresponda.

### La página de proyecto muestra "No encontrado"

- Comprobar que la URL tiene `?id=nombre-correcto`.
- El `id` en `projects.json` debe coincidir (case-insensitive).
- Revisar que `data/projects.json` se carga correctamente.

### El editor no guarda cambios

- El editor no escribe directamente en el servidor. Hay que descargar el JSON y ejecutar `node scripts/update-projects.js ruta/archivo.json`.
- Comprobar que el script se ejecuta desde la raíz del proyecto.

### El tema no se guarda

- Comprobar que `localStorage` está disponible (no en modo incógnito con restricciones).
- La clave usada es `theme`; valores: `dark` o `light`.

### ERR_BLOCKED_BY_CLIENT en gc.zgo.at/count.js

- **Causa**: Un bloqueador de anuncios o extensión de privacidad bloquea GoatCounter.
- **Solución en desarrollo**: El script ya no se carga en localhost; el error no debería aparecer al probar localmente.
- **En producción**: Visitantes con ad blocker verán el error en su consola, pero el sitio funciona. No es un bug.
- **Configurar GoatCounter**: Editar `GOATCOUNTER_CODE` en `js/modules/analytics.js`.

---

## Resumen de archivos clave para editar

| Objetivo | Archivo(s) |
|----------|------------|
| Añadir/modificar proyectos | `data/projects.json`, o usar el editor en `proyectos-simple.html` |
| Cambiar diseño de tarjetas | `data-loader.js` (createProjectCard), `editor.js` (buildCardHTML) |
| Cambiar diseño de página de proyecto | `project-detail.js` (renderProjectDetail) |
| Añadir iconos | `icons.js`, `proyectos-simple.html` (select) |
| Cambiar navegación | `templates/header.html`, `templates/footer.html` |
| Cambiar filtros | `index.html` (botones), `project-filter.js` |
| Cambiar tiempo de caché | `data-loader.js` (CACHE_TTL) |
| Cambiar tema claro/oscuro | `theme-toggle.js`, `css/main.css` ([data-theme="light"]) |
| Configurar analytics GoatCounter | `analytics.js` (GOATCOUNTER_CODE) |
