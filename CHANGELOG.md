# 📋 CHANGELOG - Intercambio Familiar Navideño

---

## [1.0.0] - Completado ✅

### Release completo con todas las funcionalidades

### Admin (index.html)
- Pantalla de registro con emojis navideños como avatares
- PIN de administrador para proteger el panel
- Dark/light mode con toggle sol/luna
- Idioma ES/EN con toggle dinámico
- Gestión de familias (CRUD) con validación de nombres duplicados
- Gestión de integrantes con correos compartidos permitidos
- Reset de contraseña por integrante (botón 🔑)
- Listas de deseos por persona (hasta N configurable)
- URLs individuales por participante con botón copiar
- Sorteo con ruleta animada y restricción familiar
- Validación pre-sorteo: muestra quiénes no tienen correo o lista vacía
- Modal post-sorteo con opción de enviar correos
- Email HTML navideño bilingüe (subject + body traducidos)
- Exportar a Excel: participantes, wishlists, sorteo, o todo junto
- Cloud sync: auto-sync cada 2s al guardar, auto-refresh cada 30s
- Botones manuales subir/descargar de la nube
- npoint Bin ID con auto-strip de URL
- Copos de nieve animados (visibles en dark y light mode)
- Fecha/hora del sorteo guardada

### Participante (my-list.html)
- Enlace base compartido (sin ID individual necesario)
- Landing con botones "Ya me registré" / "Registrarme"
- Toggle ES/EN en la pantalla de auth
- Auto-registro: seleccionar familia, nombre, correo, emoji, contraseña
- Login con nombre + contraseña
- Dashboard con 2 pestañas: Mi Lista / Mi Amigo
- Edición de wishlist con guardado a la nube
- Post-sorteo: ver persona asignada, su familia, fecha del sorteo, presupuesto, y su wishlist completa
- Botón de logout
- Soporte para enlaces directos con ?id= (retrocompatible)

### Infraestructura
- Deploy en GitHub Pages (auto-update con git push)
- npoint.io como "base de datos" en la nube (gratis, sin registro)
- EmailJS para envío de correos (200/mes gratis)
- SheetJS para exportación a Excel
- Zero frameworks: HTML/CSS/JS vanilla
- Emoji avatars: sin dependencias externas, funciona offline

---

## [0.3.0] - Fase 2: Portal del participante

### Agregado
- Reescritura completa de my-list.html como portal con auth
- Auto-registro de participantes desde enlace base compartido
- Login/registro con contraseña
- Vista de resultado del sorteo post-draw
- Fecha/hora del sorteo (sorteoDate en state)
- i18n completo ES/EN en portal del participante
- Logout button
- Auto-sync a la nube (debounce 2s)
- Auto-refresh desde la nube (cada 30s)
- Validación pre-sorteo (correos + wishlists vacías)
- Reset de contraseña desde admin
- Correos compartidos permitidos

---

## [0.2.0] - Fase 1: Admin completo

### Agregado
- Reescritura de app.js en 3 partes (core, families/wishlists, sorteo/email/export)
- Pantalla de registro con emojis navideños
- Dark/light mode toggle
- Idioma ES/EN toggle
- PIN de administrador
- Cloud sync con npoint.io (subir/descargar)
- URLs individuales con botón copiar
- Exportar a Excel (participantes, wishlists, sorteo, todo)
- Email HTML navideño bilingüe
- Validación de nombres duplicados
- Auto-strip de URL en npoint Bin ID

---

## [0.1.0] - Versión inicial

### Agregado
- Estructura base del proyecto
- Gestión de familias e integrantes
- Listas de deseos con imagen, enlace, descripción, notas
- Sorteo con restricción familiar y ruleta animada
- Envío de correos con EmailJS
- Persistencia en localStorage
- Copos de nieve animados
- Tema navideño con Google Fonts

---

## Convenciones

- ✅ Completado
- 🟢 Prioridad baja
