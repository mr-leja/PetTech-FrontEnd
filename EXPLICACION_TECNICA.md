# Explicación Técnica del Proyecto PetTech

> **NOTA:** Este documento es de uso interno / formativo. No subir al repositorio.

---

## Índice

1. [Seguridad de la aplicación](#1-seguridad-de-la-aplicación)
   - 1.1 [Cómo funciona la autenticación (JWT)](#11-cómo-funciona-la-autenticación-jwt)
   - 1.2 [Sistema de roles y permisos](#12-sistema-de-roles-y-permisos)
   - 1.3 [Protecciones en el Backend](#13-protecciones-en-el-backend)
   - 1.4 [Protecciones en el Frontend](#14-protecciones-en-el-frontend)
   - 1.5 [Configuración por entorno](#15-configuración-por-entorno)
   - 1.6 [Brechas conocidas y áreas de mejora](#16-brechas-conocidas-y-áreas-de-mejora)
2. [Cómo probar la seguridad](#2-cómo-probar-la-seguridad)
   - 2.1 [Pruebas unitarias existentes](#21-pruebas-unitarias-existentes)
   - 2.2 [Pruebas manuales recomendadas](#22-pruebas-manuales-recomendadas)
   - 2.3 [Cómo correr los tests](#23-cómo-correr-los-tests)
3. [Por qué el Calendario está dentro de Adopciones](#3-por-qué-el-calendario-está-dentro-de-adopciones)
   - 3.1 [La pregunta de clean architecture](#31-la-pregunta-de-clean-architecture)
   - 3.2 [El principio que se aplicó](#32-el-principio-que-se-aplicó)
   - 3.3 [Escenario para separarlo](#33-escenario-para-separarlo)
4. [Cómo funciona la generación del Calendario de Vacunación](#4-cómo-funciona-la-generación-del-calendario-de-vacunación)
   - 4.1 [Resumen: ¿backend o frontend?](#41-resumen-backend-o-frontend)
   - 4.2 [El backend genera las fechas (vaccination.py)](#42-el-backend-genera-las-fechas-vaccinationpy)
   - 4.3 [El frontend clasifica y presenta](#43-el-frontend-clasifica-y-presenta)
   - 4.4 [Flujo completo de punta a punta](#44-flujo-completo-de-punta-a-punta)

---

## 1. Seguridad de la aplicación

### 1.1 Cómo funciona la autenticación (JWT)

PetTech usa **JSON Web Tokens (JWT)** para autenticar a los usuarios. El flujo es el siguiente:

```
Usuario        Frontend              Backend
  |                |                    |
  |-- email+pass ->|                    |
  |                |-- POST /auth/login/->|
  |                |                    |-- Verifica credenciales
  |                |                    |-- Genera ACCESS token (60 min)
  |                |                    |-- Genera REFRESH token (7 días)
  |                |<-- { access, refresh, email, rol, nombre, id } --|
  |                |-- Guarda en localStorage (Zustand persist)
  |<-- Redirige a /dashboard --|
```

**¿Qué contiene el token JWT?**

El token no es solo un identificador; lleva información embebida. El backend personaliza el token mediante `CustomTokenObtainPairSerializer` para incluir:

| Campo             | Descripción                              |
|-------------------|------------------------------------------|
| `user_id`         | ID del usuario                           |
| `email`           | Correo electrónico                       |
| `rol`             | `ADMIN` o `FAMILIA`                      |
| `perfil_completo` | Si el usuario completó el registro       |
| `nombre`          | Nombre del usuario                       |

Esto significa que el frontend **no necesita consultar al backend** para saber quién es el usuario o qué rol tiene — esa información ya viaja dentro del token decodificado.

**¿Cómo se envía el token en cada petición?**

El frontend tiene un **interceptor en Axios** (`httpClient.ts`) que automáticamente agrega el token a cada request:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Si el backend responde con `HTTP 401` (token inválido o expirado), el interceptor automáticamente:
1. Ejecuta `logout()` → borra todo del localStorage
2. Redirige al usuario a `/login`

**Rotación de tokens:**

| Configuración              | Valor  | Qué significa                                               |
|----------------------------|--------|-------------------------------------------------------------|
| `ACCESS_TOKEN_LIFETIME`    | 60 min | El access token dura 1 hora                                 |
| `REFRESH_TOKEN_LIFETIME`   | 7 días | El refresh token dura una semana                            |
| `ROTATE_REFRESH_TOKENS`    | True   | Cada vez que se usa el refresh, se emite uno nuevo          |
| `BLACKLIST_AFTER_ROTATION` | False  | El token anterior NO se invalida (se puede reusar)          |
| `ALGORITHM`                | HS256  | Firmado con clave secreta simétrica (HMAC-SHA256)           |

---

### 1.2 Sistema de roles y permisos

Existen dos roles en el sistema:

| Rol      | ¿Quién es?                          | Permisos principales                          |
|----------|-------------------------------------|-----------------------------------------------|
| `ADMIN`  | Personal de la organización PetTech | Ver y gestionar todo; aprobar/rechazar adopciones |
| `FAMILIA`| Familia adoptante registrada        | Ver sus propias solicitudes y adopciones       |

**Permiso a nivel de clase (DRF Permissions):**

```python
# core/permissions.py

IsAdministrador      # rol == 'ADMIN'
IsFamiliaAdoptante   # rol == 'FAMILIA'
IsAdminOrReadOnly    # GET/HEAD/OPTIONS: cualquier autenticado | POST/PUT/DELETE: solo ADMIN
```

**Control de acceso a nivel de objeto (en cada vista):**

El permiso de clase dice "¿este tipo de usuario puede usar este endpoint?". El control de objeto dice "¿puede ver *este recurso específico*?". Por ejemplo:

```
GET /solicitudes/          → ADMIN ve TODAS | FAMILIA ve solo las SUYAS
GET /adopciones/           → ADMIN ve TODAS | FAMILIA ve solo las SUYAS
GET /adopciones/{id}/calendario/  → ADMIN accede a cualquiera | FAMILIA solo a sus propios calendarios
DELETE /solicitudes/{id}/  → FAMILIA solo puede cancelar sus propias solicitudes
```

Si una familia intenta acceder a la solicitud de otra familia, recibe `HTTP 403 Forbidden` o `HTTP 404 Not Found`.

---

### 1.3 Protecciones en el Backend

**1. Autenticación obligatoria por defecto:**
```python
# config/settings/base.py
'DEFAULT_PERMISSION_CLASSES': ['rest_framework.permissions.IsAuthenticated']
```
Ningún endpoint es accesible sin token válido, a menos que se marque explícitamente como `AllowAny` (solo `/auth/login/` y `/auth/registro/`).

**2. Model de usuario personalizado:**
- `AbstractBaseUser` + `PermissionsMixin` → Django no usa el modelo `auth.User` por defecto
- El campo de login es `email` (no `username`)
- Las contraseñas se almacenan **hasheadas** con el algoritmo por defecto de Django (PBKDF2+SHA256)

**3. Excepción controlada por error de datos:**
```python
# core/exceptions.py
BusinessRuleViolation  → HTTP 422
ResourceNotFound       → HTTP 404
ConflictError          → HTTP 409
```
Nunca se expone stack trace al cliente. El `custom_exception_handler` normaliza todos los errores a `{ "error": "...", "status_code": ... }`.

**4. CORS configurado:**
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:3000']
CORS_ALLOW_CREDENTIALS = True
```
Solo los orígenes permitidos pueden hacer peticiones cross-origin con credenciales.

**5. Headers de seguridad en producción:**
```python
SECURE_BROWSER_XSS_FILTER = True      # Activa el filtro XSS del navegador
SECURE_CONTENT_TYPE_NOSNIFF = True    # Evita MIME sniffing
X_FRAME_OPTIONS = 'DENY'              # Previene clickjacking (no permite iframes)
```

**6. SECRET_KEY desde variable de entorno:**
```python
SECRET_KEY = env('DJANGO_SECRET_KEY')
```
La clave secreta nunca está hardcodeada en el código fuente del repositorio.

---

### 1.4 Protecciones en el Frontend

**1. Persistencia del token en localStorage (Zustand persist):**
```
localStorage['pettech-auth'] = { token: "eyJ...", refreshToken: "eyJ...", user: {...} }
```
El token sobrevive recargas de página. Se borra al llamar `logout()`.

**2. Guards de ruta (`AppRouter.tsx`):**
```
/login, /registro          → Público. Si ya hay token → redirige a /dashboard
/dashboard, /mascotas, etc → PrivateRoute: requiere token
/solicitudes, /adopciones  → AdminRoute: requiere token + rol ADMIN
```
Un usuario `FAMILIA` que intente navegar a `/solicitudes` (panel admin) es redirigido automáticamente.

**3. Interceptores Axios:**
- **Request**: adjunta `Authorization: Bearer {token}` a todas las llamadas
- **Response**: `401` → logout + redirect a `/login`

**4. Validación de formularios con Zod:**
- Login: email válido, password mínimo 6 caracteres
- Registro: validación de confirmación de contraseña campo a campo
- Los errores del backend (`response.data.error`) se muestran en la UI

---

### 1.5 Configuración por entorno

| Configuración            | Desarrollo                      | Producción                      |
|--------------------------|---------------------------------|---------------------------------|
| `DEBUG`                  | `True`                          | `False`                         |
| `ALLOWED_HOSTS`          | `['*']` (cualquiera)            | Solo hosts configurados por env |
| CORS                     | `CORS_ALLOW_ALL_ORIGINS = True` | Solo orígenes explícitos        |
| Logging                  | Nivel DEBUG a consola           | No configurado explícitamente   |
| Headers de seguridad     | No                              | XSS filter, nosniff, DENY frame |

---

### 1.6 Brechas conocidas y áreas de mejora

> Estas son observaciones técnicas documentadas para referencia del equipo. Se dividen en **resueltas** y **pendientes**.

---

#### ✅ Resueltas

| # | Brecha resuelta                              | Cómo se corrigió                                                                                           |
|---|----------------------------------------------|------------------------------------------------------------------------------------------------------------|
| 1 | **`BLACKLIST_AFTER_ROTATION = False`**       | Activado a `True` + `rest_framework_simplejwt.token_blacklist` en `INSTALLED_APPS` + migración ejecutada. Cada refresh token usado queda en `token_blacklist_blacklistedtoken` y no puede reutilizarse. |
| 2 | **Access token de 60 min**                   | Reducido a **30 minutos** para limitar la ventana de uso si un token es comprometido. |
| 3 | **Refresh token de 7 días**                  | Reducido a **1 día**. Un token robado deja de ser útil al día siguiente. |
| 4 | **Refresh token guardado pero nunca usado**  | Implementado interceptor de refresh automático en `httpClient.ts`. Al recibir `401`, el frontend intenta `POST /auth/token/refresh/` antes de hacer logout. Si tiene éxito, actualiza el token en store y reintenta la petición original de forma transparente. Las peticiones concurrentes que lleguen durante el refresh se encolan y se resuelven con el nuevo token. Solo se fuerza logout si el refresh también falla. |
| 5 | **Producción sin HTTPS forzado**             | Agregados en `production.py`: `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS` (1 año), `SECURE_HSTS_INCLUDE_SUBDOMAINS`, `SECURE_HSTS_PRELOAD`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE`. Activar cuando el servidor tenga certificado SSL. |
| 6 | **Fallback inseguro de `SECRET_KEY`**        | Eliminado el `default='django-insecure-...'`. Ahora `env('DJANGO_SECRET_KEY')` falla explícitamente si la variable no está definida. El `.env` tiene una clave generada de forma segura con `get_random_secret_key()`. |

**Cómo funciona el nuevo interceptor de refresh (brecha #4):**

```
Petición falla con 401
        │
        ├─ ¿Es la propia llamada a /auth/token/refresh/? → rechazar directamente
        ├─ ¿Hay refreshToken en el store?  No → logout + /login
        │
        ▼  Sí → intentar refresh
POST /auth/token/refresh/ { refresh: refreshToken }
        │
        ├─ ✅ Éxito → guarda nuevo access+refresh en store
        │            → reintenta la petición original con el nuevo token
        │            → resuelve todas las peticiones encoladas
        │
        └─ ❌ Falla → logout + /login
                     → rechaza todas las peticiones encoladas
```

---

#### ⚠️ Pendiente

| # | Brecha                                  | Detalle                                                                                                    | Mejora sugerida                                                          |
|---|-----------------------------------------|------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| 1 | **Token en localStorage (no HttpOnly)** | JWT almacenado en `localStorage` es accesible desde cualquier script JavaScript de la página. Si hay una vulnerabilidad XSS, un atacante puede leer el token directamente. El refresh automático ya reduce la ventana de exposición, pero no elimina el riesgo estructural. | Almacenar el refresh token en una cookie `HttpOnly` (inaccesible desde JS). El backend lo lee en cada petición a `/auth/token/refresh/`. El access token puede vivir en memoria React (no en localStorage). Requiere cambios en backend (set-cookie) y frontend (quitar persist del refreshToken). |

---

## 2. Cómo probar la seguridad

### 2.1 Pruebas unitarias existentes

**Backend (pytest + Django test client):**

| Archivo de test                            | Qué cubre                                                                                                     |
|--------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| `apps/usuarios/tests/test_usuarios.py`     | Registro exitoso/fallido, login con tokens válidos, login con credenciales incorrectas, email no registrado, contraseña hasheada, modelo de usuario |
| `apps/adopciones/tests/test_adopciones.py` | Acceso con 401/403/404 al calendario, permisos por rol, generación automática del calendario al aprobar       |
| `apps/adopciones/tests/test_vacunacion_domain.py` | Lógica de vacunación pura: cachorros/adultos, historial, protocolos por especie, fechas              |

**Frontend (Vitest + Testing Library):**

| Archivo de test                           | Qué cubre                                                                         |
|-------------------------------------------|-----------------------------------------------------------------------------------|
| `src/test/authStore.test.ts`              | Estado inicial, `setAuth`, `logout`, `updateUser` parcial, `user=null` no rompe   |
| `src/test/calendario.domain.test.ts`      | `parseLocalDate` (sin desfase UTC), `formatFecha`, `getEstado` (fake timers)      |
| `src/test/calendarioApi.test.ts`          | Mock de httpClient, URL correcta, datos retornados, propagación de errores        |

---

### 2.2 Pruebas manuales recomendadas

**Prueba 1 — Acceso sin token:**
```bash
curl -X GET http://localhost:8000/api/v1/solicitudes/
# Esperado: HTTP 401 Unauthorized
# { "detail": "Authentication credentials were not provided." }
```

**Prueba 2 — Token inválido/expirado:**
```bash
curl -H "Authorization: Bearer tokenfalso123" http://localhost:8000/api/v1/solicitudes/
# Esperado: HTTP 401 Unauthorized
```

**Prueba 3 — FAMILIA intentando usar endpoint de ADMIN:**
```bash
# Primero obten un token de una cuenta FAMILIA
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"familia@test.com","password":"12345678"}' | python -c "import sys,json; print(json.load(sys.stdin)['access'])")

# Luego intenta aprobar una solicitud (solo ADMIN puede)
curl -X POST http://localhost:8000/api/v1/solicitudes/1/aprobar/ \
  -H "Authorization: Bearer $TOKEN"
# Esperado: HTTP 403 Forbidden
```

**Prueba 4 — FAMILIA accediendo al calendario de otra familia:**
```bash
# Con token de una familia, intenta acceder al calendario de adopcion de otra familia
curl -H "Authorization: Bearer $TOKEN_FAMILIA_A" \
  http://localhost:8000/api/v1/adopciones/99/calendario/
# Esperado: HTTP 404 Not Found (no puede "ver" el recurso ajeno)
```

**Prueba 5 — CORS desde origen no permitido (en producción):**
```bash
curl -H "Origin: http://sitio-malicioso.com" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://localhost:8000/api/v1/solicitudes/
# Esperado: No hay header Access-Control-Allow-Origin en la respuesta
```

**Prueba 6 — XSS en frontend (manual):**
- Abre DevTools → Consola
- Ejecuta: `localStorage.getItem('pettech-auth')`
- Confirma que el token está ahí; documenta el riesgo para una futura mejora con HttpOnly cookies

---

### 2.3 Cómo correr los tests

**Backend:**
```bash
cd MVP_PetTech

# Todos los tests
pytest

# Solo tests de seguridad/usuarios
pytest apps/usuarios/tests/ -v

# Solo tests de adopciones (incluye permisos del calendario)
pytest apps/adopciones/tests/ -v

# Con cobertura
pytest --cov=apps --cov-report=term-missing
```

**Frontend:**
```bash
cd MVP_FrontEnd

# Todos los tests
npm test

# En modo watch
npm run test:watch

# Con cobertura (genera coverage/)
npm run test:coverage

# Un archivo específico
npx vitest run src/test/authStore.test.ts
```

---

## 3. Por qué el Calendario está dentro de Adopciones

### 3.1 La pregunta de clean architecture

> *"¿No debería el calendario de vacunación ser su propio módulo o bounded context separado?"*

Es una pregunta válida. A primera vista, parece que "vacunación" podría ser una responsabilidad independiente de "adopciones". Pero analicemos qué es realmente el calendario en este sistema:

- No existe sin una adopción aprobada
- No se puede generar sin saber: qué mascota (especie, edad), qué fecha se adoptó, y qué vacunas ya tiene
- Es un **subproducto directo del evento de aprobación de una adopción**

### 3.2 El principio que se aplicó

**Clean Architecture** promueve separar en capas (domain, infrastructure, interfaces) dentro de cada feature, y agrupar por **bounded context** (contexto delimitado), no por tipo técnico.

La pregunta correcta no es *"¿es el calendario algo diferente?"*, sino *"¿tiene el calendario un ciclo de vida propio, independiente de las adopciones?"*.

La respuesta en este MVP es **no**:

```
Adopcion aprobada
      │
      ├──► se crea un registro Adopcion
      │
      └──► se genera un CalendarioVacunacion (automáticamente, no hay acción manual)
                └──► tiene EntradaCalendario[] como detalle
```

El calendario **vive y muere con la adopción**. No hay operaciones de negocio del calendario que ocurran fuera del contexto de adopciones; no hay un caso de uso como "crear calendario directo sin adopción".

**Esto es consistente con DDD (Domain-Driven Design):** si dos conceptos siempre se crean juntos, se modifican en el mismo contexto de negocio, y nunca son consultados de forma independiente entre ellos, pertenecen al mismo Aggregate o al mismo Bounded Context.

**Estructura resultante dentro de adopciones (clean architecture interna):**

```
apps/adopciones/
├── domain/
│   ├── entities.py        ← SolicitudAdopcionEntity, AdopcionEntity (objetos de dominio puros)
│   ├── exceptions.py      ← Excepciones de negocio del dominio adopciones
│   └── vaccination.py     ← Lógica pura del calendario (sin Django, sin DB, sin HTTP)
│                            Protocolos, reglas por especie, cálculo de fechas
├── infrastructure/
│   ├── models.py          ← ORM: SolicitudAdopcion, Adopcion, CalendarioVacunacion, EntradaCalendario
│   └── repositories.py    ← SolicitudRepository, AdopcionRepository, CalendarioRepository
└── interfaces/
    ├── views.py           ← Vistas HTTP, control de acceso, orquestación
    ├── serializers.py     ← Serialización/deserialización de datos
    └── urls.py            ← Rutas del módulo
```

`vaccination.py` es dominio puro:
- No importa Django, ni models, ni requests
- Solo trabaja con `date`, `dataclass`, `Enum`
- Es **completamente testeable de forma aislada** (ver `test_vacunacion_domain.py`)

Esto cumple perfectamente Clean Architecture: la lógica de negocio (cuándo vacunar, por especie) está en el dominio; la persistencia en infraestructura; y la exposición HTTP en interfaces.

### 3.3 Escenario para separarlo

Sería correcto extraer el calendario a su propio módulo cuando se presenten uno o más de estos escenarios:

- El veterinario puede crear o editar calendarios de forma independiente, sin importar el estado de la adopción
- El calendario tiene su propio flujo de aprobación/notificación distinto al de la adopción
- Se necesita generar calendarios para mascotas que nunca han pasado por el proceso de adopción (p.e. mascotas propias)
- El equipo de trabajo se divide y un equipo es dueño de "vacunación" mientras otro es dueño de "adopciones"

En el contexto actual del MVP ninguna de estas condiciones se cumple.

---

## 4. Cómo funciona la generación del Calendario de Vacunación

### 4.1 Resumen: ¿backend o frontend?

| Responsabilidad                                             | ¿Dónde?   |
|-------------------------------------------------------------|-----------|
| Calcular qué vacunas necesita la mascota                   | **Backend** |
| Calcular las fechas concretas de cada vacuna               | **Backend** |
| Persistir el calendario en la base de datos                | **Backend** |
| Mostrar el calendario al usuario                           | Frontend  |
| Clasificar visualmente cada vacuna (próxima/vencida)        | Frontend  |
| Formatear fechas en español para la UI                     | Frontend  |

La generación real del calendario es **100% backend**. El frontend solo consume y presenta las fechas pre-calculadas.

---

### 4.2 El backend genera las fechas (`vaccination.py`)

**El trigger:** Cuando un administrador aprueba una solicitud de adopción (`POST /solicitudes/{id}/aprobar/`), la vista llama automáticamente al generador:

```python
# interfaces/views.py — SolicitudAdopcionDecisionView (simplificado)
def aprobar(solicitud):
    solicitud.estado = 'APROBADA'
    mascota.estado = 'ADOPTADO'
    adopcion = adopcion_repo.crear(solicitud_id, fecha_adopcion=date.today())

    calendario_data = schedule_generator.generate(
        especie     = mascota.especie,          # 'PERRO', 'GATO', etc.
        edad_anios  = calcular_edad(mascota),
        edad_unidad = unidad_edad(mascota),
        historial   = mascota.historial_vacunas, # lista de vacunas que ya tiene
        fecha_adopcion = date.today()
    )
    calendario_repo.crear_con_entradas(adopcion.id, calendario_data)
```

**¿Qué hace `VaccinationScheduleGenerator.generate()`?**

```
Entrada:
  especie          → 'PERRO'
  edad_anios       → 0 (o fracción)
  edad_unidad      → 'MESES'
  historial        → ['Parvovirus', 'Moquillo']  ← ya tiene estas
  fecha_adopcion   → 2026-03-27

Proceso:
  1. ¿Es cachorro?   edad <= 12 meses → Sí
  2. Selecciona protocolo: ProtocoloPerro
  3. Genera vacunas candidatas según protocolo:
     - Parvovirus          → ya está en historial → se OMITE
     - Moquillo            → ya está en historial → se OMITE
     - Hepatitis           → fecha_adopcion + 7 días = 2026-04-03
     - Rabia (cachorro)    → fecha_adopcion + 30 días = 2026-04-26
     - Refuerzo Parvovirus → fecha_adopcion + 28 días = 2026-04-24
     (...etc.)
  4. Genera notas de texto informativas

Salida (CalendarioGenerado):
  vacunas: [
    { nombre: 'Hepatitis',       fecha_sugerida: date(2026,4,3),  es_refuerzo: false },
    { nombre: 'Rabia',           fecha_sugerida: date(2026,4,26), es_refuerzo: false },
    { nombre: 'Ref. Parvovirus', fecha_sugerida: date(2026,4,24), es_refuerzo: true  },
    ...
  ]
  notas: "Especie: PERRO | Edad: 0 año(s) 3 mes(es) | Historial: 2 vacunas previas"
```

**Protocolos por especie:**

| Especie   | Vacunas incluidas (si no están en historial)                             | Nota especial          |
|-----------|--------------------------------------------------------------------------|------------------------|
| `PERRO`   | Parvovirus (+ refuerzo si cachorro), Moquillo (+ refuerzo), Hepatitis, Rabia, Polivalente anual (si adulto) | |
| `GATO`    | Panleucopenia (+ refuerzo si cachorro), Calicivirus, Rinotraqueítis, Rabia, Triple Felina anual (si adulto) | |
| `CONEJO`  | Mixomatosis, RHD                                                          | Día +14                |
| Otros     | Consulta veterinaria preventiva                                           | Día +7; clase `ProtocoloGenerico` |

**Cálculo de fechas:**

| Vacuna                         | Días desde fecha de adopción |
|--------------------------------|------------------------------|
| Primera dosis (general)        | + 7 días                     |
| Mixomatosis / RHD (conejo)     | + 14 días                    |
| Refuerzo de cachorro           | + 28 días                    |
| Rabia en cachorro              | + 30 días                    |
| Rabia en adulto                | + 14 días                    |
| Polivalente/Triple anual       | + 365 días                   |

**Filtrado del historial:**

La comparación con el historial es **case-insensitive** y por **coincidencia parcial**:
```python
def _ya_vacunado(vacuna: str, historial: set[str]) -> bool:
    vacuna_lower = vacuna.lower()
    return any(vacuna_lower in h or h in vacuna_lower for h in historial)
```
Esto evita que `"parvovirus"` y `"Parvovirus"` cuenten como vacunas distintas.

**Persistencia en base de datos:**

```
CalendarioVacunacion (OneToOne → Adopcion)
  id
  fecha_generacion
  notas
  └── EntradaCalendario[] (muchas → una)
        id
        nombre_vacuna     ← "Parvovirus"
        descripcion       ← texto informativo
        fecha_sugerida    ← date(2026, 4, 3)   ← CALCULADA EN BACKEND
        es_refuerzo       ← bool
        completada        ← bool (False por defecto)
```

---

### 4.3 El frontend clasifica y presenta

Una vez que el backend generó y almacenó el calendario, el frontend lo solicita:

```typescript
// calendarioApi.ts
calendarioApi.obtener(adopcionId)
// → GET /adopciones/{id}/calendario/
// → Respuesta: { id, notas, fecha_generacion, entradas: [...] }
```

El módulo `calendarioDomain.ts` del frontend **solo hace tres cosas**:

**1. Parsear la fecha sin desfase UTC:**
```typescript
// El problema: new Date('2026-04-03') interpreta la fecha como UTC medianoche,
// lo que en zonas UTC-5 muestra el día anterior.
// La solución:
function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    return new Date(year, month - 1, day)  // meses son 0-indexed
}
```

**2. Formatear en español colombiano:**
```typescript
function formatFecha(dateStr: string): string {
    return parseLocalDate(dateStr).toLocaleDateString('es-CO', {
        year: 'numeric', month: 'long', day: 'numeric'
    })
    // Ejemplo: "3 de abril de 2026"
}
```

**3. Determinar el estado visual de cada vacuna:**
```typescript
function getEstado(entrada: EntradaCalendario): 'completada' | 'vencida' | 'proxima' {
    if (entrada.completada) return 'completada'   // verde/gris
    const hoy = new Date(); hoy.setHours(0,0,0,0)
    const fecha = parseLocalDate(entrada.fecha_sugerida)
    return fecha < hoy ? 'vencida' : 'proxima'    // rojo : verde
}
```

La fecha concreta (`2026-04-03`) ya vino del backend. El frontend solo compara contra "hoy" para saber si el color es verde o rojo.

---

### 4.4 Flujo completo de punta a punta

```
ADMIN en la UI
   │
   ├─ Hace clic en "Aprobar solicitud" + escribe notas
   │
   ▼
POST /api/v1/solicitudes/{id}/aprobar/
   │ Authorization: Bearer {token_admin}
   │
   ▼
Backend: SolicitudAdopcionDecisionView
   │
   ├─ Verifica permisos: IsAuthenticated + IsAdministrador
   ├─ Cambia solicitud.estado → 'APROBADA'
   ├─ Cambia mascota.estado → 'ADOPTADO'
   ├─ Crea registro Adopcion en DB
   │
   ├─ Llama schedule_generator.generate(especie, edad, historial, fecha)
   │     └── vaccination.py: selecciona protocolo, filtra historial, calcula fechas
   │
   ├─ Llama calendario_repo.crear_con_entradas(adopcion.id, vacunas)
   │     └── Persiste CalendarioVacunacion + N EntradaCalendario en PostgreSQL
   │
   └─ Responde HTTP 200 { "mensaje": "Solicitud aprobada correctamente" }

FAMILIA en la UI (después)
   │
   ├─ Navega a "Mis Adopciones" → hace clic en ver calendario
   │
   ▼
GET /api/v1/adopciones/{adopcion_id}/calendario/
   │ Authorization: Bearer {token_familia}
   │
   ▼
Backend: CalendarioVacunacionView
   │
   ├─ Verifica permisos: IsAuthenticated + pertenece a esta familia
   ├─ Recupera CalendarioVacunacion con sus EntradaCalendario[]
   └─ Serializa y responde HTTP 200 con JSON

Frontend: CalendarioVacunacionPage
   │
   ├─ React Query guarda el resultado en caché
   ├─ Para cada EntradaCalendario:
   │     ├─ calendarioDomain.getEstado() → 'proxima' | 'vencida' | 'completada'
   │     └─ calendarioDomain.formatFecha() → "3 de abril de 2026"
   └─ Renderiza tabla coloreada con próximas y vencidas en contadores
```

---

*Documento interno — no subir al repositorio.*
