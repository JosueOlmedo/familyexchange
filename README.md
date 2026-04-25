# 🎄 Intercambio Familiar Navideño

Aplicación web para organizar intercambios de regalos navideños entre familias. Permite gestionar participantes, listas de deseos, sorteo con restricciones familiares, y envío de resultados por correo.

---

## 📁 Estructura del Proyecto

```
Intercambios familiares/
├── index.html          ← Panel de administración (página principal)
├── my-list.html        ← Portal del participante (registro/login/wishlist/resultado)
├── css/
│   └── styles.css      ← Estilos con dark/light mode y tema navideño
├── js/
│   ├── app.js          ← Lógica principal del admin ✅
│   ├── i18n.js         ← Traducciones español/inglés (admin) ✅
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
| 7 | Envío de correos con EmailJS (HTML i18n) | app.js | ✅ |
| 8 | Modal de confirmación post-sorteo | index.html, app.js | ✅ |
| 9 | Persistencia en localStorage | app.js | ✅ |
| 10 | Copos de nieve animados (dark + light mode) | app.js, styles.css | ✅ |
| 11 | Dark/light mode toggle | styles.css, app.js | ✅ |
| 12 | Traducciones ES/EN (admin) | i18n.js, app.js | ✅ |
| 13 | Traducciones ES/EN (participante) | my-list.html | ✅ |
| 14 | Cloud storage con npoint.io | storage.js, app.js | ✅ |
| 15 | Auto-sync a la nube (debounce 2s) | app.js | ✅ |
| 16 | Auto-refresh desde la nube (cada 30s) | app.js | ✅ |
| 17 | Pantalla de registro admin con emojis navideños | index.html, app.js | ✅ |
| 18 | User badge (emoji + nombre en header) | index.html, app.js | ✅ |
| 19 | PIN de administrador | index.html, app.js | ✅ |
| 20 | Portal del participante (registro/login/wishlist/resultado) | my-list.html | ✅ |
| 21 | Auto-registro de participantes (enlace base compartido) | my-list.html | ✅ |
| 22 | Contraseña por participante | my-list.html | ✅ |
| 23 | Reset de contraseña desde admin (botón 🔑) | app.js | ✅ |
| 24 | Logout en portal del participante | my-list.html | ✅ |
| 25 | Ver resultado del sorteo + fecha/hora | my-list.html, app.js | ✅ |
| 26 | Validación pre-sorteo (sin correo + sin lista) | app.js | ✅ |
| 27 | Correos compartidos (hijos con correo del padre) | app.js | ✅ |
| 28 | Validación de nombres duplicados por familia | app.js | ✅ |
| 29 | URLs individuales con botón copiar | app.js | ✅ |
| 30 | Exportar a Excel (SheetJS) | app.js | ✅ |
| 31 | Email HTML navideño bilingüe (subject + body) | app.js, i18n.js | ✅ |
| 32 | npoint Bin ID en configuración (auto-strip URL) | app.js | ✅ |
| 33 | Deploy a GitHub Pages | - | ✅ |

### Pendientes 🔧
| # | Funcionalidad | Prioridad |
|---|--------------|-----------|
| A | Pulido UI/UX | 🟢 Baja |
| B | Testing end-to-end | 🟢 Baja |

---

## 🏗️ Arquitectura

### Flujo del Admin (index.html)
```
Registro (nombre + emoji) → PIN (si configurado)
    ↓
Header (emoji + nombre + dark mode + idioma)
    ↓
┌─────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│   Config    │  Familias    │   Listas     │   Sorteo     │  Exportar    │
│             │              │              │              │              │
│ - Max gifts │ - CRUD       │ - Por persona│ - Validación │ - Excel      │
│ - Evento    │   familias   │ - Hasta N    │   (correo +  │   participan │
│ - Budget    │ - CRUD       │   regalos    │   wishlist)  │   tes        │
│ - Admin PIN │   miembros   │ - URLs indiv │ - Ruleta     │ - Excel      │
│ - npoint ID │ - Reset 🔑   │ - Cloud sync │ - Restricción│   wishlists  │
│ - EmailJS   │   password   │              │   familiar   │ - Excel      │
│ - Cloud     │              │              │ - Modal      │   sorteo     │
│   sync      │              │              │ - Email HTML │              │
│ - Auto-sync │              │              │   bilingüe   │              │
│   (2s)      │              │              │              │              │
│ - Auto-     │              │              │              │              │
│   refresh   │              │              │              │              │
│   (30s)     │              │              │              │              │
└─────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

### Flujo del Participante (my-list.html)
```
Enlace base: my-list.html?bin=NPOINT_BIN_ID
    ↓
┌─────────────────────────────────────┐
│  Landing: "Ya me registré" / "Registrarme"  │
│  + Toggle ES/EN                              │
└──────────────┬──────────────────────┘
               ↓
┌──────────────┴──────────────┐
│  Registro:                   │  Login:
│  - Seleccionar familia       │  - Seleccionar nombre
│  - Nombre, correo            │  - Contraseña
│  - Emoji avatar              │
│  - Contraseña                │
└──────────────┬──────────────┘
               ↓
┌──────────────┴──────────────┐
│  Dashboard:                  │
│  - Mi Lista (editar wishlist)│
│  - Mi Amigo (post-sorteo)    │
│    → Nombre + familia        │
│    → Fecha/hora del sorteo   │
│    → Presupuesto             │
│    → Wishlist de esa persona │
│  - Logout                    │
└──────────────────────────────┘
```

### Almacenamiento
- **localStorage**: Datos del admin (familias, wishlists, config, sorteo, sesión)
- **npoint.io**: Sincronización en la nube (auto-sync cada 2s, auto-refresh cada 30s)
  - Admin sube cambios automáticamente
  - Participantes leen/escriben directamente a la nube

### Estructura del State
```json
{
  "config": {
    "maxGifts": 5,
    "eventName": "Intercambio Navidad 2025",
    "budget": "$500 MXN",
    "adminPin": "1234",
    "npointBinId": "8fcbc26bcaa818cd20bb",
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
        {
          "id": "m1",
          "name": "Josué",
          "email": "josue@mail.com",
          "password": "hashed",
          "avatar": "🎅"
        }
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
  ],
  "sorteoDate": "2025-11-15T20:30:00.000Z"
}
```

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| HTML/CSS/JS vanilla | Frontend sin frameworks |
| Emoji avatars | Avatares navideños sin dependencias externas |
| [npoint.io](https://www.npoint.io/) | JSON storage gratuito (cloud sync) |
| [EmailJS](https://www.emailjs.com/) | Envío de correos HTML desde el navegador (200/mes gratis) |
| [SheetJS (XLSX)](https://sheetjs.com/) | Exportación a Excel |
| [Font Awesome 6](https://fontawesome.com/) | Iconos |
| [Google Fonts](https://fonts.google.com/) | Mountains of Christmas + Nunito |
| localStorage | Persistencia local del admin |

---

## 📦 Despliegue

### GitHub Pages (Actual) ✅
- **Admin**: https://josueolmedo.github.io/familyexchange/
- **Participantes**: https://josueolmedo.github.io/familyexchange/my-list.html?bin=BIN_ID
- Se actualiza automáticamente con cada `git push`

### Cómo actualizar
```bash
git add . && git commit -m "descripción" && git push
```

---

## ⚙️ Configuración Inicial

1. **Crear bin en npoint.io**:
   - Ir a https://www.npoint.io/
   - Pegar `{}` como contenido → Save
   - Copiar solo el ID del bin (no la URL completa)

2. **Configurar EmailJS** (para envío de correos):
   - Crear cuenta en https://www.emailjs.com/
   - Conectar servicio de correo
   - Crear template con variables (3 llaves):
     - Subject: `{{{email_subject}}}`
     - Body: `{{{email_body}}}`
     - To: `{{to_email}}`
   - Copiar Public Key, Service ID, Template ID

3. **Abrir index.html** → Config → llenar todo → Guardar

4. **Crear familias** (vacías) → los participantes se auto-registran

5. **Compartir enlace base** en el chat familiar:
   `https://josueolmedo.github.io/familyexchange/my-list.html?bin=TU_BIN_ID`

---

## 🔐 Seguridad

- **Admin**: Protegido con PIN configurable
- **Participantes**: Cada uno tiene su contraseña
- **Reset de contraseña**: El admin puede resetear desde la pestaña Familias (botón 🔑)
- **Nota**: Las contraseñas se almacenan en texto plano en npoint.io. Esto es aceptable para un intercambio familiar pero no para datos sensibles.

---

## 🎯 Próximos Pasos

1. 🟢 **Testing** end-to-end de todos los flujos
2. 🟢 **Pulido** de UI/UX si se detectan detalles
