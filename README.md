# 🎄 Intercambio Familiar Navideño

Aplicación web para organizar intercambios de regalos navideños entre familias. Permite gestionar participantes, listas de deseos, sorteo con restricciones familiares, y envío de resultados por correo.

---

## 📁 Estructura del Proyecto

```
Intercambios familiares/
├── index.html          ← Panel de administración (página principal)
├── mi-lista.html       ← Página individual para cada participante
├── css/
│   └── styles.css      ← Estilos con dark/light mode y tema navideño
├── js/
│   ├── app.js          ← Lógica principal del admin ✅
│   ├── i18n.js         ← Traducciones español/inglés ✅
│   └── storage.js      ← Módulo de almacenamiento en la nube (npoint.io) ✅
├── assets/             ← Carpeta para recursos estáticos
├── README.md           ← Este archivo
└── CHANGELOG.md        ← Historial de cambios
```

---

## 🚀 Funcionalidades

### Implementadas ✅
| # | Funcionalidad | Archivo(s) | Estado |
|---|--------------|------------|--------|
| 1 | Gestión de familias/grupos | index.html, app.js | ✅ |
| 2 | Gestión de integrantes (nombre + correo) | index.html, app.js | ✅ |
| 3 | Listas de deseos (título, enlace, imagen, descripción, notas) | index.html, app.js | ✅ |
| 4 | Máximo de regalos configurable | index.html, app.js | ✅ |
| 5 | Sorteo con restricción familiar | app.js | ✅ |
| 6 | Animación de ruleta en el sorteo | app.js, styles.css | ✅ |
| 7 | Envío de correos con EmailJS | app.js | ✅ |
| 8 | Modal de confirmación post-sorteo | index.html, app.js | ✅ |
| 9 | Persistencia en localStorage | app.js | ✅ |
| 10 | Copos de nieve animados | app.js, styles.css | ✅ |
| 11 | CSS con dark/light mode | styles.css, app.js | ✅ Toggle funcional |
| 12 | Traducciones ES/EN | i18n.js, app.js | ✅ Toggle funcional |
| 13 | Cloud storage con npoint.io | storage.js, app.js | ✅ Subir/descargar |
| 14 | Página individual para participantes | mi-lista.html | ✅ |
| 15 | Pantalla de registro con avatares DiceBear | index.html, app.js | ✅ |
| 16 | User badge (nombre + avatar en header) | index.html, app.js | ✅ |
| 17 | URLs individuales con botón copiar | app.js | ✅ |
| 18 | Exportar a Excel (SheetJS) | app.js | ✅ |
| 19 | npoint Bin ID en configuración | app.js | ✅ |

### Pendientes 🔧
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| A | Testing end-to-end | 🟢 Baja |
| B | Deploy a GitHub Pages | 🟢 Baja |

---

## 🏗️ Arquitectura

### Flujo del Admin (index.html)
```
Registro (nombre + avatar DiceBear)
    ↓
Header (nombre visible + avatar + dark mode + idioma)
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Config    │  Familias    │   Listas     │   Sorteo     │  Exportar    │
│             │              │              │              │              │
│ - Max gifts │ - CRUD       │ - Por persona│ - Validación │ - Excel      │
│ - Evento    │   familias   │ - Hasta N    │ - Ruleta     │   participan │
│ - Budget    │ - CRUD       │   regalos    │ - Restricción│   tes        │
│ - npoint ID │   miembros   │ - URLs indiv │   familiar   │ - Excel      │
│ - EmailJS   │              │ - Cloud sync │ - Modal      │   wishlists  │
│ - Cloud     │              │              │ - Email      │ - Excel      │
│   sync      │              │              │              │   sorteo     │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Flujo del Participante (mi-lista.html)
```
URL: mi-lista.html?id=MEMBER_ID&bin=NPOINT_BIN_ID
    ↓
Carga datos desde npoint.io
    ↓
Muestra info del participante (nombre, familia, correo)
    ↓
Editar lista de deseos (hasta N regalos)
    ↓
Guardar → npoint.io (cloud)
```

### Almacenamiento
- **localStorage**: Datos del admin (familias, wishlists, config, sorteo, sesión de usuario)
- **npoint.io** (opcional): Sincronización en la nube para que participantes editen sus listas remotamente

### Estructura del State
```json
{
  "config": {
    "maxGifts": 5,
    "eventName": "Intercambio Navidad 2025",
    "budget": "$500 MXN",
    "npointBinId": "",
    "senderEmail": "",
    "emailjsPublicKey": "",
    "emailjsServiceId": "",
    "emailjsTemplateId": ""
  },
  "families": [
    {
      "id": "abc123",
      "name": "Familia Olmedo",
      "members": [
        { "id": "m1", "name": "Josué", "email": "josue@mail.com" }
      ]
    }
  ],
  "wishlists": {
    "m1": [
      {
        "title": "Audífonos Bluetooth",
        "link": "https://...",
        "imageUrl": "https://...",
        "description": "Color negro, over-ear",
        "notes": "Marca Sony preferiblemente"
      }
    ]
  },
  "sorteoResult": [
    { "giverId": "m1", "receiverId": "m5" }
  ]
}
```

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| HTML/CSS/JS vanilla | Frontend sin frameworks |
| [DiceBear Avatars](https://www.dicebear.com/) | Avatares gratuitos por API |
| [npoint.io](https://www.npoint.io/) | JSON storage gratuito (cloud sync) |
| [EmailJS](https://www.emailjs.com/) | Envío de correos desde el navegador (200/mes gratis) |
| [SheetJS (XLSX)](https://sheetjs.com/) | Exportación a Excel |
| [Font Awesome 6](https://fontawesome.com/) | Iconos |
| [Google Fonts](https://fonts.google.com/) | Mountains of Christmas + Nunito |
| localStorage | Persistencia local |

---

## 📦 Despliegue

### Opción 1: GitHub Pages (Recomendada - Gratis)
1. Crear repositorio en GitHub
2. Subir todos los archivos
3. Settings → Pages → Source: main branch
4. URL: `https://tuusuario.github.io/intercambio-navideno/`

### Opción 2: Netlify / Vercel (Gratis)
1. Conectar repositorio
2. Deploy automático en cada push

### Opción 3: VS Code Live Server (Solo local/desarrollo)
1. Instalar extensión "Live Server"
2. Click derecho en index.html → "Open with Live Server"
3. Solo funciona mientras tu PC esté encendida

---

## ⚙️ Configuración Inicial

1. **Crear bin en npoint.io** (opcional, para URLs individuales):
   - Ir a https://www.npoint.io/
   - Pegar `{}` como contenido
   - Copiar el ID del bin

2. **Configurar EmailJS** (para envío de correos):
   - Crear cuenta en https://www.emailjs.com/
   - Conectar servicio de correo
   - Crear template con variables: `{{to_email}}`, `{{to_name}}`, `{{event_name}}`, `{{assigned_person}}`, `{{wishlist}}`, `{{budget}}`
   - Copiar Public Key, Service ID, Template ID

3. **Abrir index.html** y configurar todo en la pestaña "Config"

---

## 🎯 Próximos Pasos

1. 🟢 **Testing** end-to-end de todos los flujos
2. 🟢 **Deploy** a GitHub Pages
3. 🟢 **Pulido** de UI/UX si se detectan detalles
