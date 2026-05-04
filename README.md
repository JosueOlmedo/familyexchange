# 🎄 Intercambio Familiar Navideño

Aplicación web para organizar intercambios de regalos navideños entre familias. Permite gestionar participantes, listas de deseos, sorteo con restricciones familiares, y envío de resultados por correo.

---

## 📁 Estructura del Proyecto

```
Intercambios familiares/
├── index.html          ← Panel de administración
├── my-list.html        ← Portal del participante (registro/login/wishlist/resultado)
├── css/
│   └── styles.css      ← Estilos con dark/light mode y tema navideño
├── js/
│   ├── app.js          ← Lógica principal del admin ✅
│   ├── i18n.js         ← Traducciones español/inglés ✅
│   └── storage.js      ← Módulo Firebase Realtime Database ✅
├── assets/             ← Recursos estáticos
├── README.md           ← Este archivo
├── CHANGELOG.md        ← Historial de cambios
└── FLOW-DIAGRAM.md     ← Diagrama de flujo y análisis de vulnerabilidades
```

---

## 🔗 URLs

| Página | URL | Quién la usa |
|--------|-----|-------------|
| Admin | https://josueolmedo.github.io/familyexchange/ | Solo el organizador |
| Participantes | https://josueolmedo.github.io/familyexchange/my-list.html | Todos los familiares |

---

## 🚀 Funcionalidades

### Admin (index.html)
- Registro con emojis navideños como avatar
- PIN de administrador
- Dark/light mode + ES/EN toggle
- CRUD de familias e integrantes
- Reset de contraseña por integrante (🔑)
- Listas de deseos por persona
- URLs individuales con botón copiar
- Sorteo con ruleta animada + restricción familiar
- Validación pre-sorteo (sin correo / sin lista)
- Email HTML navideño bilingüe (EmailJS)
- Exportar a Excel (participantes, wishlists, sorteo)
- Auto-refresh desde Firebase cada 30s
- Link directo a página de participantes

### Participante (my-list.html)
- Enlace base compartido (sin parámetros necesarios)
- Landing: "Ya me registré" / "Registrarme" + toggle ES/EN
- Auto-registro: seleccionar familia → nombre → correo → emoji → contraseña
- Login con nombre + contraseña
- Dark/light mode + ES/EN en dashboard
- Edición de wishlist con guardado directo a Firebase
- Post-sorteo: ver persona asignada + su wishlist + fecha/hora
- Logout

---

## 🏗️ Arquitectura

### Almacenamiento
- **Firebase Realtime Database**: Todos los datos (familias, wishlists, config, sorteo)
  - Operaciones atómicas por path (no overwrite total)
  - `/exchange/config` — configuración
  - `/exchange/families` — familias e integrantes
  - `/exchange/wishlists/{memberId}` — wishlist por persona
  - `/exchange/sorteoResult` — resultado del sorteo
  - `/exchange/sorteoDate` — fecha del sorteo
- **localStorage**: Solo sesión admin (nombre+avatar) y preferencias (tema, idioma)

### Flujo del Admin
```
Registro (nombre + emoji) → PIN (si configurado)
    ↓
Header (emoji + nombre + dark mode + idioma + link participante)
    ↓
Config → Familias → Listas → Sorteo → Exportar
```

### Flujo del Participante
```
my-list.html (enlace base)
    ↓
"Ya me registré" / "Registrarme" + ES/EN
    ↓
Registro: familia → nombre → correo → emoji → contraseña
Login: nombre → contraseña
    ↓
Dashboard: Mi Lista | Mi Amigo + Logout + Dark/Light + ES/EN
```

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| HTML/CSS/JS vanilla | Frontend sin frameworks |
| [Firebase Realtime Database](https://firebase.google.com/) | Base de datos en la nube (gratis) |
| [EmailJS](https://www.emailjs.com/) | Envío de correos HTML (200/mes gratis) |
| [SheetJS (XLSX)](https://sheetjs.com/) | Exportación a Excel |
| [Font Awesome 6](https://fontawesome.com/) | Iconos |
| [Google Fonts](https://fonts.google.com/) | Mountains of Christmas + Nunito |
| Emoji avatars | Sin dependencias externas |

---

## 📦 Despliegue

### GitHub Pages (Actual) ✅
- Se actualiza automáticamente con cada `git push`
- `git add . && git commit -m "descripción" && git push`

---

## ⚙️ Configuración Inicial

1. **Firebase** (ya configurado):
   - Proyecto: `familiexchange`
   - Database URL: `https://familiexchange-default-rtdb.firebaseio.com`

2. **EmailJS** (para envío de correos):
   - Template con 3 llaves: Subject `{{{email_subject}}}`, Body `{{{email_body}}}`, To `{{to_email}}`

3. **Abrir admin** → Config → llenar EmailJS + PIN → Guardar

4. **Crear familias** (vacías) → compartir enlace base en el chat familiar

---

## 🔐 Seguridad

- Admin protegido con PIN
- Cada participante tiene contraseña
- Reset de contraseña desde admin (🔑)
- Firebase en test mode (aceptable para uso familiar)
- Contraseñas en texto plano (aceptable para intercambio familiar)

---

## 🎯 Próximos Pasos

1. 🟢 Testing end-to-end
2. 🟢 Pulido UI/UX
