# 🔍 Diagrama de Flujo - Análisis de Vulnerabilidades

## 1. Flujo de Escritura: Admin (app.js)

```
Admin edita algo (familia, miembro, wishlist, config)
    │
    ▼
saveState()
    │
    ├──► localStorage.setItem() ✅ Inmediato, sin conflicto
    │
    └──► autoSync() [debounce 5s]
              │
              ▼
         ¿Usuario editando? ──SI──► ⏸️ Skip (retry en próximo saveState)
              │
              NO
              ▼
         CloudStorage.safeSave(mergeFn)
              │
              ▼
         ┌─────────────────────────┐
         │ 1. LOAD cloud data      │
         │ 2. mergeFn(cloud) →     │
         │    merged = cloud+local │
         │    preserva wishlists   │
         │    preserva passwords   │
         │    preserva registros   │
         │ 3. merged._version++    │
         │ 4. POST merged          │
         │ 5. LOAD again (verify)  │
         │ 6. ¿version match?      │
         └────────┬────────────────┘
                  │
         ┌────────┴────────┐
         SI                NO
         │                 │
         ✅ OK          ⚠️ Retry (hasta 3x)
                           │
                     ¿3 intentos?
                     SI → ❌ Fail silencioso
```

### 🔴 Vulnerabilidades identificadas:

**V1: Ventana entre LOAD y POST (Race Condition)**
```
T=0s  Admin LOAD (version=5)
T=0.1s Participante LOAD (version=5)
T=0.2s Admin POST (version=6) ✅
T=0.3s Participante POST (version=6) ✅ ← SOBREESCRIBE admin!
T=0.4s Admin VERIFY → version=6 (del participante, no del admin)
         Admin cree que su save fue exitoso pero fue el del participante
```
**Impacto**: ALTO — El verify puede leer la versión del participante y creer que es la suya.
**Solución**: Agregar un `_writer` ID único por sesión además de `_version`.

---

**V2: Auto-refresh (30s) sobreescribe edits locales no guardados**
```
T=0s  Admin empieza a editar nombre de familia
T=5s  Admin sigue escribiendo (no ha salido del input)
T=30s Auto-refresh: ¿input focused? → SI → Skip ✅
T=35s Admin sale del input → onchange → saveState()
T=60s Auto-refresh: ¿input focused? → NO → LOAD cloud
       → Sobreescribe state con datos de la nube
       → renderFamilies() → El edit del admin se pierde si
         otro participante se registró entre T=35s y T=60s
```
**Impacto**: MEDIO — Si un participante se registra justo después de que el admin editó, el auto-refresh trae los datos del participante pero puede perder el edit del admin que aún no se sincronizó.
**Solución**: El auto-refresh debería hacer merge en vez de overwrite.

---

**V3: Participante save sobreescribe a otro participante**
```
T=0s  Participante A abre página → LOAD (tiene wishlists de A y B)
T=1s  Participante B abre página → LOAD (tiene wishlists de A y B)
T=5s  Participante A guarda wishlist → saveWishlist('A', items)
       → safeSave: LOAD → cloud.wishlists.A = items → POST ✅
T=6s  Participante B guarda wishlist → saveWishlist('B', items)
       → safeSave: LOAD → cloud.wishlists.B = items → POST ✅
```
**Impacto**: BAJO — saveWishlist solo toca su propio key. ✅ Esto funciona bien.

---

**V4: Participante registro + Admin editando familias simultáneamente**
```
T=0s  Admin tiene 2 familias, edita nombre de Familia1
T=1s  Participante se registra en Familia2 → saveMember()
       → safeSave: LOAD → agrega member a Familia2 → POST ✅
T=5s  Admin autoSync → safeSave(mergeFn)
       → LOAD cloud (tiene nuevo member en Familia2) ✅
       → merge: admin families + cloud members → POST ✅
```
**Impacto**: BAJO — El merge del admin preserva nuevos registros. ✅

---

**V5: npoint.io no tiene autenticación**
```
Cualquier persona con el Bin ID puede:
  - LEER todos los datos (familias, emails, passwords, sorteo)
  - ESCRIBIR/BORRAR todos los datos
```
**Impacto**: ALTO para datos sensibles, BAJO para intercambio familiar.
**Solución**: Aceptable para el caso de uso. Las contraseñas son texto plano pero solo protegen quién ve qué regalo, no datos bancarios.

---

**V6: Passwords en texto plano**
```
npoint.io JSON:
{
  "families": [{
    "members": [{
      "name": "Josué",
      "password": "mipassword123"  ← visible para quien tenga el bin ID
    }]
  }]
}
```
**Impacto**: MEDIO — Cualquiera con el bin ID puede ver las contraseñas.
**Solución futura**: Hash con SHA-256 antes de guardar (bcrypt no disponible en browser sin lib).

---

## 2. Flujo de Escritura: Participante (my-list.html)

```
Participante abre my-list.html?bin=XXX
    │
    ▼
CloudStorage.load() → cloudData
    │
    ▼
¿Tiene ?id= en URL?
    │
    ├──SI──► findMember(id) → showAuthForMember()
    │
    └──NO──► showLanding()
                │
                ├── "Registrarme" → showRegisterForm()
                │       │
                │       ▼
                │   Llena datos → handleRegister()
                │       │
                │       ▼
                │   CloudStorage.saveMember(familyId, newMember)
                │       │
                │       ▼
                │   safeSave: LOAD → agrega member → POST → VERIFY
                │       │                                    │
                │       ▼                                    ▼
                │   showDashboard()              ⚠️ V7: Si falla,
                │                                el user cree que se
                │                                registró pero no se guardó
                │
                └── "Ya me registré" → showLoginForm()
                        │
                        ▼
                    Selecciona nombre + password
                        │
                        ▼
                    ¿password match? ──NO──► Error
                        │
                        SI
                        ▼
                    showDashboard()
                        │
                        ▼
                    ┌────┴────┐
                    │ Mi Lista │ Mi Amigo │
                    │          │          │
                    │ Edit     │ Read-only│
                    │ wishlist │ sorteo   │
                    │          │ result   │
                    └────┬─────┘
                         │
                    "Guardar Mi Lista"
                         │
                         ▼
                    CloudStorage.saveWishlist(memberId, items)
                         │
                         ▼
                    safeSave: LOAD → wishlists[id]=items → POST → VERIFY ✅
```

### 🔴 Vulnerabilidades adicionales:

**V7: Registro exitoso en UI pero falla en cloud**
```
handleRegister() → family.members.push(newMember) [local]
                 → CloudStorage.saveMember() [cloud]
                 → showDashboard() [se ejecuta sin esperar resultado]
```
**Impacto**: MEDIO — El participante ve el dashboard pero sus datos no se guardaron.
**Solución**: Await el saveMember y mostrar error si falla.

---

**V8: No hay logout real — datos en memoria**
```
Participante A hace login → cloudData en memoria con TODOS los datos
    → Puede ver en DevTools: contraseñas de otros, sorteo completo
```
**Impacto**: BAJO — Es un intercambio familiar, no un banco.

---

**V9: Sin rate limiting en npoint.io**
```
Auto-refresh cada 30s + auto-sync cada 5s + saves manuales
= Muchas requests a npoint.io
Si hay 10 participantes activos = ~120 requests/min
npoint.io podría throttlear o bloquear
```
**Impacto**: MEDIO — Podría causar errores de guardado.
**Solución**: Aumentar intervalos o usar exponential backoff.

---

## 3. Flujo de Lectura: Auto-refresh Admin

```
Cada 30 segundos:
    │
    ▼
¿Input/textarea/select focused? ──SI──► Skip ✅
    │
    NO
    ▼
CloudStorage.load()
    │
    ▼
Overwrite state (preservando config local)
    │
    ▼
localStorage.setItem() ← ⚠️ V10: No usa saveState()
    │                         por lo que NO triggerea autoSync
    ▼                         (esto es correcto, evita loop)
renderFamilies()
populateWishlistSelect()
```

### 🔴 Vulnerabilidad:

**V10: Auto-refresh hace overwrite, no merge**
```
T=0s  Admin agrega Familia3 → saveState() → autoSync pendiente (5s)
T=2s  Auto-refresh ejecuta → LOAD cloud (no tiene Familia3 aún)
       → state = cloudData → Familia3 desaparece del UI
T=5s  autoSync ejecuta → pero state ya no tiene Familia3
       → sube a la nube sin Familia3 → PERDIDA DE DATOS ❌
```
**Impacto**: ALTO — Este es probablemente el bug que estás experimentando.
**Solución**: Auto-refresh debe hacer merge, no overwrite.

---

## 4. Resumen de Prioridades

| # | Vulnerabilidad | Impacto | Esfuerzo | Prioridad |
|---|---------------|---------|----------|-----------|
| V10 | Auto-refresh overwrite (no merge) | 🔴 ALTO | Bajo | 🔴 URGENTE |
| V1 | Race condition en verify | 🔴 ALTO | Medio | 🟡 Media |
| V2 | Auto-refresh vs edits no sincronizados | 🟡 MEDIO | Bajo | 🟡 Media |
| V7 | Registro sin await | 🟡 MEDIO | Bajo | 🟡 Media |
| V5 | npoint sin auth | 🟡 MEDIO | N/A | 🟢 Aceptable |
| V6 | Passwords texto plano | 🟡 MEDIO | Medio | 🟢 Aceptable |
| V9 | Rate limiting | 🟡 MEDIO | Bajo | 🟢 Baja |
| V3 | Wishlist save (ya OK) | 🟢 BAJO | N/A | ✅ Resuelto |
| V4 | Registro + admin edit (ya OK) | 🟢 BAJO | N/A | ✅ Resuelto |
| V8 | Datos en memoria | 🟢 BAJO | N/A | 🟢 Aceptable |

---

## 5. Fix Recomendado para V10 (URGENTE)

El auto-refresh del admin debe hacer merge en vez de overwrite:

```javascript
// ANTES (actual - PIERDE DATOS):
state = { ...defaultState(), ...data };

// DESPUÉS (correcto - MERGE):
// Preservar cambios locales que aún no se sincronizaron
state.families = mergedFamilies(state.families, data.families);
state.wishlists = { ...data.wishlists, ...state.wishlists };
state.sorteoResult = data.sorteoResult || state.sorteoResult;
state.sorteoDate = data.sorteoDate || state.sorteoDate;
```
