# 📋 CHANGELOG - Intercambio Familiar Navideño

Todas las versiones y cambios del proyecto documentados aquí.

---

## [0.3.0] - Completado ✅

### Estado: Todas las funcionalidades implementadas

`app.js` fue reescrito completamente en 3 partes. Todas las funcionalidades del HTML ahora tienen su lógica JS correspondiente.

### Agregado
- **Pantalla de registro**: Overlay con nombre + 12 avatares DiceBear (10 estilos distintos). Sesión persistida en localStorage.
- **User badge en header**: Avatar + nombre visibles mientras se usa la app.
- **Dark/Light mode**: Toggle funcional con persistencia. Icono sol/luna dinámico.
- **Idioma ES/EN**: Toggle funcional. Actualiza todos los `data-i18n`, `data-i18n-html` y `data-i18n-placeholder` dinámicamente. Persistido en localStorage.
- **Familias**: CRUD completo con traducciones dinámicas.
- **Wishlists**: CRUD por persona, límite configurable, traducciones.
- **URLs individuales**: Generación automática `mi-lista.html?id=X&bin=Y` con botón copiar al clipboard. Requiere npoint.io configurado.
- **Sorteo con ruleta**: Animación de 4s con easing, restricción familiar, modal post-sorteo.
- **Envío de correos**: EmailJS integrado con spinner y reporte de enviados/errores.
- **Cloud sync**: Subir/descargar estado completo a npoint.io. Al descargar, preserva credenciales locales (EmailJS, binId).
- **Exportar a Excel**: 4 botones (participantes, wishlists, sorteo, todo). Usa SheetJS. Archivo con múltiples hojas en modo "todo".
- **npoint Bin ID**: Campo en config, integrado con cloud sync y URLs.

### Archivos modificados
- `index.html` - Reescrito con registro, dark mode, i18n, export ✅
- `css/styles.css` - Reescrito con dark/light mode, avatares, responsive ✅
- `js/i18n.js` - Traducciones ES/EN completas ✅
- `js/storage.js` - Módulo CloudStorage (npoint.io) ✅
- `js/app.js` - **Reescrito completo** en 3 partes ✅
  - Part 1: State, init, registration, theme, i18n, navigation, snowflakes, config
  - Part 2: Families, wishlists, member URLs, sorteo status
  - Part 3: Sorteo + roulette, email, cloud sync, Excel export

---

## [0.2.0] - Completado ✅

### Agregado
- **Página del participante** (`mi-lista.html`)
  - Acceso por URL con query params `?id=MEMBER_ID&bin=BIN_ID`
  - Carga datos desde npoint.io
  - Muestra info del participante (nombre, familia, correo)
  - Edición de lista de deseos con auto-save a la nube
  - Estados: loading, error (enlace inválido), wishlist
  - Preview de imágenes en tiempo real
  - Copos de nieve animados

- **Módulo CloudStorage** (`js/storage.js`)
  - Conexión con npoint.io (API REST gratuita)
  - Métodos: init, load, save, saveWishlist, loadWishlist
  - Manejo de errores

### Archivos creados
- `mi-lista.html` ✅
- `js/storage.js` ✅

---

## [0.1.0] - Completado ✅

### Versión inicial funcional (solo admin, solo localStorage)

### Agregado
- **Configuración general**
  - Máximo de regalos por persona (default: 5)
  - Nombre del evento
  - Presupuesto máximo
  - Credenciales de EmailJS (Public Key, Service ID, Template ID)

- **Gestión de familias**
  - Crear/eliminar familias/grupos
  - Agregar/eliminar integrantes con nombre y correo
  - Edición inline de datos

- **Listas de deseos**
  - Selector de integrante por familia
  - Hasta N regalos por persona (configurable)
  - Cada regalo: título, enlace URL, URL de imagen (con preview), descripción, notas
  - Agregar/eliminar regalos

- **Sorteo con restricción familiar**
  - Validación: mínimo 2 integrantes, mínimo 2 familias, todos con correo
  - Algoritmo: shuffle + validación de que giver y receiver sean de familias distintas
  - Hasta 1000 intentos para encontrar combinación válida
  - Animación de ruleta giratoria (4-9 vueltas, easing cubic-bezier)
  - Modal de confirmación post-sorteo
  - Visualización de resultados (giver → receiver con familia)
  - Opción de nuevo sorteo

- **Envío de correos (EmailJS)**
  - Envío individual a cada participante
  - Incluye: nombre del evento, persona asignada, lista de deseos formateada, presupuesto
  - Indicador de progreso (spinner)
  - Reporte de enviados/errores

- **UI/UX**
  - Tema navideño (rojo, verde, dorado)
  - Fuente Mountains of Christmas para títulos
  - Copos de nieve animados (30 partículas CSS)
  - Navegación por pestañas
  - Toasts de notificación
  - Responsive design
  - Font Awesome icons

- **Persistencia**
  - Todo el state en localStorage
  - Auto-save en cada cambio

### Archivos creados
- `index.html` ✅
- `css/styles.css` ✅
- `js/app.js` ✅

---

## Convenciones

- 🔴 Prioridad crítica (blocker)
- 🟡 Prioridad media
- 🟢 Prioridad baja (nice to have)
- ✅ Completado
- 🚧 En progreso
- ⚠️ Tiene problemas
