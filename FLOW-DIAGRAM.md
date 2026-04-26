# 🔍 Diagrama de Flujo - Análisis de Vulnerabilidades (Post-Fix)

## 1. Flujo de Escritura: Admin (app.js)

```
Admin edita algo
    │
    ▼
saveState()
    │
    ├──► localStorage ✅ Inmediato
    │
    └──► autoSync() [debounce 5s]
              │
              ▼
         ¿Usuario editando? ──SI──► ⏸️ Skip
              │
              NO
              ▼
         CloudStorage.safeSave(mergeFn)
              │
              ▼
         ┌──────────────────────────────┐
         │ 1. LOAD cloud (_version=N)   │
         │ 2. mergeFn(cloud):           │
         │    - cloud + local wishlists  │
         │    - preserva passwords      │
         │    - preserva avatars        │
         │    - agrega nuevos miembros  │
         │ 3. merged._version = N+1    │
         │ 4. POST merged              │
         │ 5. LOAD verify              │
         │ 6. ¿_version === N+1?       │
         └────────┬────────────────────┘
                  │
            ┌─────┴─────┐
            SI          NO → Retry (3x)
            ✅              │
                       ¿3 intentos? → ❌ Fail
```

## 2. Flujo de Lectura: Auto-refresh Admin (cada 30s)

```
setInterval 30s
    │
    ▼
¿Input/textarea/select focused? ──SI──► ⏸️ Skip ✅
    │
    NO
    ▼
CloudStorage.load()
    │
    ▼
MERGE (no overwrite) ✅ [V10 FIXED]
    │
    ├── wishlists: { ...cloud, ...local }  ← local gana
    ├── sorteoResult: cloud ?? local
    ├── sorteoDate: cloud ?? local
    ├── families: merge members bidireccional
    │     ├── nuevos miembros de cloud → se agregan
    │     └── passwords/avatars → cloud actualiza local
    └── config: preserva keys locales (PIN, EmailJS, binId)
    │
    ▼
renderFamilies() + populateWishlistSelect()
```

## 3. Flujo: Participante Registro (my-list.html)

```
Participante abre enlace base
    │
    ▼
CloudStorage.load() → cloudData
    │
    ▼
Landing: "Ya me registré" / "Registrarme"
    │
    ├── Registrarme:
    │     │
    │     ▼
    │   Selecciona familia + nombre + email + avatar + password
    │     │
    │     ▼
    │   handleRegister() [async] ✅ [V7 FIXED]
    │     │
    │     ▼
    │   await CloudStorage.saveMember(familyId, member)
    │     │
    │     ├── OK → showDashboard()
    │     └── FAIL → showAuthError() + rollback ✅
    │
    └── Ya me registré:
          │
          ▼
        Selecciona nombre + password
          │
          ▼
        ¿match? ──NO──► Error
          │
          SI → showDashboard()
```

## 4. Flujo: Participante Guarda Wishlist

```
Participante edita wishlist → "Guardar Mi Lista"
    │
    ▼
CloudStorage.saveWishlist(memberId, items)
    │
    ▼
safeSave: LOAD → cloud.wishlists[myId] = items → POST → VERIFY
    │
    ▼
Solo toca SU key en wishlists ✅
Otros wishlists intactos ✅
Families intactas ✅
Config intacta ✅
```

## 5. Flujo: Sorteo + Email

```
Admin → Sorteo → "¡Iniciar!"
    │
    ▼
Validación:
    ├── < 2 miembros → ❌ Bloqueado
    ├── < 2 familias → ❌ Bloqueado
    ├── Sin correo → ⚠️ Warning (nombres)
    └── Sin wishlist → ⚠️ Warning (nombres)
    │
    ▼
performSorteo() [hasta 1000 intentos]
    │
    ▼
Restricción: giver ≠ receiver, familias distintas
    │
    ▼
Ruleta animada (4s)
    │
    ▼
state.sorteoResult + state.sorteoDate = now
    │
    ▼
saveState() → autoSync → safeSave ✅
    │
    ▼
Modal: "¿Enviar correos?"
    │
    ├── SI → sendEmails()
    │         │
    │         ▼
    │   Para cada par giver→receiver:
    │     buildEmailHtml() [idioma actual]
    │     emailjs.send({ to_email, email_subject, email_body })
    │     │
    │     ├── Correo compartido: hijos reciben en email del padre ✅
    │     └── Sin correo: skip (errors++)
    │
    └── NO → Cerrar modal
```

---

## 6. Estado de Vulnerabilidades

| # | Vulnerabilidad | Estado | Detalle |
|---|---------------|--------|---------|
| V1 | Race condition en verify | ⚠️ ABIERTA | safeSave verifica _version pero 2 writers con mismo timing podrían pasar. Impacto bajo con pocos usuarios. |
| V2 | Auto-refresh vs edits no sync | ✅ FIXED | Auto-refresh ahora hace merge, no overwrite. |
| V3 | Wishlist save entre participantes | ✅ OK | saveWishlist solo toca su key. |
| V4 | Registro + admin edit simultáneo | ✅ OK | safeSave merge preserva ambos. |
| V5 | npoint sin autenticación | ⚠️ ACEPTADO | Cualquiera con bin ID puede leer/escribir. OK para uso familiar. |
| V6 | Passwords texto plano | ⚠️ ACEPTADO | Visible en npoint. OK para intercambio familiar. |
| V7 | Registro sin await | ✅ FIXED | handleRegister es async, await saveMember, rollback si falla. |
| V8 | Datos en memoria (DevTools) | ⚠️ ACEPTADO | Participante podría ver datos en consola. Bajo riesgo. |
| V9 | Rate limiting npoint | ⚠️ ACEPTADO | Debounce 5s + skip si editando reduce requests. |
| V10 | Auto-refresh overwrite | ✅ FIXED | Ahora hace merge bidireccional. |

---

## 7. Vulnerabilidades Abiertas - Análisis de Riesgo

### V1: Race Condition en Verify (Riesgo: BAJO)
```
Escenario: 2 personas guardan exactamente al mismo tiempo
Probabilidad: Muy baja (ventana de ~200ms)
Impacto: Un save se pierde, se recupera en el siguiente auto-sync
Mitigación actual: safeSave retry 3x con delay aleatorio
Mitigación futura: Agregar _writerId único por sesión
```

### V5: npoint sin Auth (Riesgo: ACEPTADO)
```
Escenario: Alguien encuentra el bin ID y borra datos
Probabilidad: Baja (necesita el ID específico)
Impacto: Pérdida total de datos
Mitigación: Exportar a Excel como backup periódico
```

### V6: Passwords Texto Plano (Riesgo: ACEPTADO)
```
Escenario: Alguien lee el JSON de npoint y ve passwords
Probabilidad: Baja
Impacto: Puede ver el sorteo de otra persona
Mitigación futura: SHA-256 hash en browser antes de guardar
```

---

## 8. Protecciones Activas

| Protección | Dónde | Cómo |
|-----------|-------|------|
| Optimistic locking | storage.js | _version + verify + retry 3x |
| Merge on write | app.js autoSync | safeSave con mergeFn |
| Merge on read | app.js auto-refresh | Merge bidireccional, no overwrite |
| Edit guard | app.js | Skip sync si input focused |
| Debounce | app.js | 5s después del último cambio |
| Partial writes | my-list.html | saveWishlist/saveMember solo tocan su dato |
| Await + rollback | my-list.html | handleRegister rollback si cloud falla |
| PIN admin | app.js | Protege panel admin |
| Passwords | my-list.html | Cada participante tiene su password |
| Duplicate check | app.js + my-list.html | Nombres duplicados por familia |
