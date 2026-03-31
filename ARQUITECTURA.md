# Arquitectura PetTech — Guía técnica

> Este documento explica cómo está construido el sistema, qué hace cada archivo, cómo funciona la autenticación JWT, dónde se guardan las imágenes y qué mejoras de seguridad son necesarias.

---

## Índice

1. [Visión general del sistema](#1-visión-general-del-sistema)
2. [Arquitectura del Backend (Django)](#2-arquitectura-del-backend-django)
3. [Arquitectura del Frontend (React)](#3-arquitectura-del-frontend-react)
4. [Cómo funciona JWT en PetTech](#4-cómo-funciona-jwt-en-pettech)
5. [Seguridad aplicada en el sistema](#5-seguridad-aplicada-en-el-sistema)
6. [Manejo de imágenes y archivos](#6-manejo-de-imágenes-y-archivos)
7. [Mejoras de seguridad pendientes](#7-mejoras-de-seguridad-pendientes)

---

## 1. Visión general del sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                          FRONTEND                               │
│              React 18 + TypeScript + Vite                       │
│         localhost:5173  →  /api/v1  (proxy a backend)          │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTP (JWT Bearer en headers)
┌──────────────────────────▼──────────────────────────────────────┐
│                          BACKEND                                │
│               Django 5 + Django REST Framework                  │
│                      localhost:8000                             │
└────────────┬──────────────────────────────────┬─────────────────┘
             │                                  │
┌────────────▼────────────┐    ┌────────────────▼────────────────┐
│    PostgreSQL 16         │    │           MinIO (S3)            │
│  Base de datos principal │    │  Almacenamiento de imágenes     │
│  pettech_db:5432         │    │  pettech_minio:9000             │
└─────────────────────────┘    └─────────────────────────────────┘
```

Todos los servicios corren en contenedores Podman definidos en `docker-compose.yml`.

---

## 2. Arquitectura del Backend (Django)

El backend sigue una **arquitectura en capas (Clean Architecture)** dividida en tres niveles para cada app Django:

```
apps/
├── domain/           → Reglas de negocio puras (excepciones, tipos)
├── infrastructure/   → Modelos de BD y repositorios (acceso a datos)
└── interfaces/       → Serializers, Views y URLs (capa HTTP)
```

### Estructura completa de archivos

```
MVP_PetTech/
├── apps/
│   ├── usuarios/
│   │   ├── domain/                    # Reglas de negocio de usuarios
│   │   ├── infrastructure/
│   │   │   └── models.py              # Modelo Usuario (AbstractBaseUser)
│   │   ├── interfaces/
│   │   │   ├── serializers.py         # Serializers: RegistroSerializer, CustomTokenObtainPairSerializer
│   │   │   ├── views.py               # LoginView, RegistroView, PerfilView
│   │   │   └── urls.py                # Rutas: /auth/login/, /auth/registro/, /auth/perfil/
│   │   └── management/commands/       # Comando para crear admin por defecto al iniciar
│   │
│   ├── mascotas/
│   │   ├── domain/
│   │   │   └── exceptions.py          # MascotaNoEncontrada, etc.
│   │   ├── infrastructure/
│   │   │   ├── models.py              # Modelo Mascota (fotos, vacunas JSON, estado, etc.)
│   │   │   └── repositories.py        # MascotaRepository: listar, obtener, crear, eliminar
│   │   └── interfaces/
│   │       ├── serializers.py         # MascotaSerializer, MascotaCreateSerializer, MascotaUpdateSerializer
│   │       ├── views.py               # MascotaListCreateView, MascotaDetailView
│   │       └── urls.py                # Rutas: /mascotas/, /mascotas/{id}/
│   │
│   └── familias/
│       ├── infrastructure/
│       │   └── models.py              # Modelos Familia y CondicionesHogar (OneToOne con Usuario)
│       └── interfaces/
│           ├── serializers.py         # FamiliaCreateSerializer, CondicionesHogarSerializer
│           ├── views.py               # MiFamiliaView, CondicionesHogarView, ListadoFamiliasView
│           └── urls.py                # Rutas: /familias/mia/, /familias/mia/condiciones-hogar/, /familias/
│
├── config/
│   ├── settings/
│   │   ├── base.py                    # Configuración base: BD, JWT, CORS, MinIO, DRF, permisos
│   │   ├── development.py             # Sobreescribe base: DEBUG=True, CORS abierto, logging consola
│   │   └── production.py             # Configuración para producción
│   ├── urls.py                        # URLconf raíz: agrupa todas las rutas bajo /api/v1/
│   └── wsgi.py / asgi.py             # Entrypoints para servidores WSGI/ASGI
│
├── core/
│   ├── permissions.py                 # IsAdministrador, IsFamiliaAdoptante, IsAdminOrReadOnly
│   ├── pagination.py                  # StandardPagination (10 items por página)
│   ├── exceptions.py                  # Excepciones personalizadas
│   └── exception_handler.py          # Handler global: formatea todos los errores de DRF
│
├── start.py                           # Script de arranque: espera PostgreSQL, ejecuta migrate, levanta servidor
├── Dockerfile                         # Imagen de producción
├── Dockerfile.dev                     # Imagen de desarrollo
└── docker-compose.yml                 # Orquestación: db (PostgreSQL), minio, backend
```

### Descripción de los archivos clave del Backend

| Archivo | Qué hace |
|---------|----------|
| `apps/usuarios/infrastructure/models.py` | Define el modelo `Usuario` con email como identificador (en lugar de username), roles `ADMIN`/`FAMILIA`, y flag `perfil_completo` |
| `apps/usuarios/interfaces/serializers.py` | `CustomTokenObtainPairSerializer` agrega `rol`, `nombre`, `email`, `perfil_completo` al JWT. `RegistroSerializer` valida y crea usuarios |
| `apps/usuarios/interfaces/views.py` | `LoginView` verifica si el email existe antes de delegar a simplejwt. `RegistroView` crea nuevos usuarios. `PerfilView` lee/elimina la cuenta |
| `apps/mascotas/infrastructure/repositories.py` | Capa de acceso a datos para mascotas. Las vistas **nunca hacen queries directamente**; siempre pasan por el repositorio |
| `apps/mascotas/interfaces/views.py` | `MascotaListCreateView` (GET lista, POST crea), `MascotaDetailView` (GET, PATCH, DELETE). Protegidos por `IsAdminOrReadOnly` |
| `apps/familias/interfaces/views.py` | `MiFamiliaView` (GET/POST/PATCH de la familia del usuario actual), `CondicionesHogarView` (GET/POST/PATCH del hogar), `ListadoFamiliasView` (solo ADMIN) |
| `core/permissions.py` | Clases de permiso reutilizables: `IsAdministrador` bloquea todo excepto ADMIN, `IsAdminOrReadOnly` permite lectura a todos |
| `config/settings/base.py` | Configura: tokens JWT (60 min access, 7 días refresh), CORS permitidos, MinIO como storage de archivos, DRF con autenticación JWT por defecto |
| `start.py` | Se ejecuta al iniciar el contenedor: espera a que PostgreSQL esté listo (reintenta 60 veces), corre `migrate`, luego levanta Django |

---

## 3. Arquitectura del Frontend (React)

El frontend usa una arquitectura de **Feature Sliced Design** — el código se organiza por funcionalidad, no por tipo de archivo.

```
MVP_FrontEnd/src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── authApi.ts            # Llamadas a /auth/login/, /auth/registro/, /auth/token/refresh/
│   │   └── pages/
│   │       ├── LoginPage.tsx         # Formulario de login, llama authApi.login(), guarda token en store
│   │       └── RegisterPage.tsx      # Formulario multi-paso: crea cuenta → registra familia → registra hogar
│   │
│   ├── dashboard/
│   │   └── pages/
│   │       └── DashboardPage.tsx     # Página de inicio post-login: saludo, contadores, acceso rápido
│   │
│   ├── mascotas/
│   │   ├── api/
│   │   │   └── mascotasApi.ts        # listar, obtener, crear, actualizar (PATCH), eliminar (DELETE)
│   │   ├── components/
│   │   │   ├── MascotaCard.tsx       # Tarjeta de mascota en el grid. Si es ADMIN muestra icono de borrar
│   │   │   └── MascotaDetalleModal.tsx # Modal con info completa. Si es ADMIN muestra icono de editar
│   │   └── pages/
│   │       ├── ListadoMascotasPage.tsx  # Grid de mascotas con filtros + modal de confirmación de borrado
│   │       ├── RegistrarMascotaPage.tsx # Formulario 2 pasos para crear mascota (solo ADMIN)
│   │       └── EditarMascotaPage.tsx    # Formulario 2 pasos pre-cargado para editar mascota (solo ADMIN)
│   │
│   └── familias/
│       ├── api/
│       │   └── familiasApi.ts        # miFamilia, crearFamilia, actualizarFamilia, condicionesHogar, eliminarCuenta
│       └── pages/
│           ├── RegistrarFamiliaPage.tsx  # Formulario 2 pasos: info personal + hogar/experiencia. Detecta si ya existe (PATCH) o es nuevo (POST)
│           └── CondicionesHogarPage.tsx  # Vista del perfil del adoptante: muestra datos, editar, eliminar cuenta
│
├── router/
│   └── AppRouter.tsx                 # Define rutas: públicas, privadas (PrivateRoute) y de admin (AdminRoute)
│
└── shared/
    ├── api/
    │   └── httpClient.ts             # Cliente Axios configurado: agrega token JWT en cada request, maneja 401 global
    ├── components/
    │   ├── PrivateRoute.tsx          # Redirige a /login si no hay token
    │   ├── AdminRoute.tsx            # Redirige a /dashboard si el usuario no es ADMIN
    │   ├── NavBar.tsx                # Barra de navegación principal
    │   ├── Button.tsx                # Botón reutilizable con estado de carga
    │   ├── Input.tsx                 # Input con label y mensaje de error
    │   ├── Spinner.tsx               # Indicador de carga
    │   └── EmptyState.tsx            # Mensaje cuando no hay resultados
    └── store/
        └── authStore.ts              # Estado global de autenticación con Zustand + persistencia en localStorage
```

### Descripción de archivos clave del Frontend

| Archivo | Qué hace |
|---------|----------|
| `shared/store/authStore.ts` | Guarda `token` (access), `refreshToken` y datos del `user` en `localStorage` via Zustand `persist`. Al hacer `logout()` limpia todo |
| `shared/api/httpClient.ts` | Instancia de Axios. Interceptor de **request**: agrega `Authorization: Bearer <token>`. Interceptor de **response**: si llega 401 → hace logout y redirige a `/login` |
| `router/AppRouter.tsx` | `PrivateRoute` protege rutas autenticadas. `AdminRoute` protege rutas exclusivas de admin verificando `user.rol === 'ADMIN'` |
| `features/auth/api/authApi.ts` | Métodos `login()`, `registro()`, `refreshToken()`. El login devuelve access + refresh tokens y datos del usuario |
| `features/mascotas/api/mascotasApi.ts` | `actualizar()` usa `PATCH` con `FormData` (para soportar archivos). `eliminar()` usa `DELETE` |
| `features/familias/pages/RegistrarFamiliaPage.tsx` | En `useEffect` consulta si ya existe un perfil (`miFamilia()`): si sí, hace `reset()` del formulario con los datos existentes y usa PATCH al guardar |

---

## 4. Cómo funciona JWT en PetTech

### Flujo completo de autenticación

```
Usuario escribe credenciales
         │
         ▼
LoginPage.tsx → authApi.login({ email, password })
         │
         ▼                                            ┌─────────────────────┐
POST /api/v1/auth/login/  ──────────────────────────► │   LoginView         │
                                                      │  (backend)          │
                                                      │                     │
                                                      │ 1. Verifica si      │
                                                      │    email existe     │
                                                      │ 2. Valida password  │
                                                      │ 3. Genera JWT       │
                                                      └────────┬────────────┘
                                                               │
         ◄─────────────────────────────────────────────────────┘
{ access: "eyJ...", refresh: "eyJ...", email, rol, nombre, perfil_completo }
         │
         ▼
authStore.setAuth(access, refresh, user)
→ guardado en localStorage como "pettech-auth"
         │
         ▼
Cada request siguiente:
httpClient interceptor agrega:
  Authorization: Bearer eyJ...
```

### Anatomía del token JWT

El token tiene **tres partes** separadas por punto:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← Header (algoritmo: HS256)
.
eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWlu  ← Payload (datos del usuario)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV    ← Firma (verifica integridad)
```

**Datos que viajan dentro del token** (claim personalizados en `CustomTokenObtainPairSerializer`):

| Campo | Valor de ejemplo | Uso |
|-------|-----------------|-----|
| `user_id` | `1` | Identifica al usuario en el backend |
| `email` | `"admin@pettech.com"` | Mostrar en UI |
| `rol` | `"ADMIN"` o `"FAMILIA"` | Controlar permisos tanto en backend como frontend |
| `perfil_completo` | `true` / `false` | Saber si mostrar el banner de "completa tu perfil" en el dashboard |
| `nombre` | `"Juan Pérez"` | Saludo personalizado en la UI |
| `exp` | timestamp | Cuándo expira el token |

### Tiempos de vida configurados

| Token | Duración | Propósito |
|-------|----------|-----------|
| **Access token** | 60 minutos | Se adjunta a cada request. Si expira, el frontend recibe 401 |
| **Refresh token** | 7 días | Se usa para renovar el access token sin pedir contraseña |
| `ROTATE_REFRESH_TOKENS` | `True` | Cada vez que se usa el refresh, se genera uno nuevo |

### Renovación del token

Cuando `httpClient` recibe un `401`, llama a `logout()` y redirige a `/login`. **Actualmente no hay renovación automática silenciosa** con el refresh token (ver sección de mejoras).

---

## 5. Seguridad aplicada en el sistema

### Backend

| Mecanismo | Implementación |
|-----------|----------------|
| **Autenticación JWT** | `JWTAuthentication` de `djangorestframework-simplejwt`. Todas las rutas requieren token válido por defecto |
| **Control de roles** | `IsAdministrador`, `IsFamiliaAdoptante`, `IsAdminOrReadOnly` en `core/permissions.py`. Se aplican view por view |
| **Contraseñas hasheadas** | Django usa `PBKDF2` con SHA256 por defecto. Nunca se guarda la contraseña en texto plano |
| **Variables de entorno** | Credenciales de BD, clave secreta Django y claves de MinIO se leen del `.env`, nunca hardcodeadas en código |
| **CORS** | En producción solo los orígenes listados en `CORS_ALLOWED_ORIGINS` pueden hacer requests. En desarrollo se permite todo |
| **Protecciones Django por defecto** | `CSRF`, `XFrameOptionsMiddleware` (X-Frame-Options: DENY), `SecurityMiddleware` (HSTS en producción) |
| **Validación de datos** | Todos los datos de entrada pasan por serializers DRF antes de llegarle a la base de datos |
| **Bloqueo por rol en DELETE** | Un usuario `ADMIN` no puede eliminarse a sí mismo. Un usuario `FAMILIA` no puede borrar mascotas |
| **Estado ADOPTADO protegido** | El backend bloquea eliminar mascotas con estado `ADOPTADO` |
| **Logging de acciones** | Se registran con `logger.info` las acciones críticas: creación de mascotas, eliminación de cuenta, registro de usuarios |

### Frontend

| Mecanismo | Implementación |
|-----------|----------------|
| **Rutas protegidas** | `PrivateRoute` bloquea el acceso si no hay token. `AdminRoute` bloquea si no es ADMIN |
| **Token en memoria + localStorage** | Zustand con `persist` guarda en `localStorage`. Al cerrar sesión, se borra todo |
| **Logout automático en 401** | El interceptor de Axios detecta 401 global → limpia el store → redirige a login |
| **Validación de formularios** | `zod` + `react-hook-form` validan los datos antes de enviarlos al backend |
| **Bloqueo de caracteres peligrosos** | Campos numéricos bloquean `e`, `E`, `+`, `-` con `onKeyDown` para evitar inputs malformados |
| **UI condicional por rol** | Los botones de "Agregar mascota", "Editar", "Eliminar" solo se renderizan si `user.rol === 'ADMIN'` |

---

## 6. Manejo de imágenes y archivos

### ¿Las imágenes van a la base de datos o a la nube?

**Van a la nube**, específicamente a **MinIO**, que es un servicio de almacenamiento de objetos compatible con la API de Amazon S3.

```
Usuario sube foto de mascota
         │
         ▼
React frontend → FormData con el archivo
         │
         ▼
Django backend recibe el archivo
         │
         ▼
Almacenado en MinIO (bucket: "pettech-fotos")
  mascotas/   → fotos de mascotas
  carnets/    → carnets de vacunas
         │
         ▼
En la BD PostgreSQL se guarda únicamente la URL pública:
  foto_url = "http://localhost:9000/pettech-fotos/mascotas/xyz.jpg"
         │
         ▼
El frontend usa esa URL directamente en <img src={mascota.foto_url} />
```

### Configuración de MinIO

MinIO corre como contenedor en `pettech_minio:9000` con:
- Consola web: `http://localhost:9001`
- API compatible con S3 configurada en Django como `DEFAULT_FILE_STORAGE`
- `AWS_DEFAULT_ACL = 'public-read'` → las fotos son accesibles públicamente por URL

### Tipos de archivos almacenados

| Tipo | Campo en modelo | Ruta en MinIO | Descripción |
|------|-----------------|---------------|-------------|
| Foto de mascota | `Mascota.foto` | `mascotas/` | Imagen o video de la mascota |
| Carnet de vacunas | `Mascota.carnet_vacunas` | `carnets/` | PDF o imagen del carnet |

> **Nota:** el modelo `Familia` no almacena fotos actualmente. El campo `foto_cedula` fue removido del formulario.

---

## 7. Mejoras de seguridad pendientes

Las siguientes mejoras no están implementadas en el MVP actual y son necesarias antes de un despliegue en producción:

### Alta prioridad

| Mejora | Problema actual | Cómo resolverlo |
|--------|----------------|-----------------|
| **Token refresh silencioso** | Cuando el access token expira (60 min), el usuario es desconectado abruptamente. No hay renovación automática | Agregar un interceptor en `httpClient.ts` que, al recibir un 401, intente llamar `/auth/token/refresh/` con el `refreshToken`, y si funciona, reintente el request original |
| **Blacklist de refresh tokens** | Al hacer logout, el refresh token sigue siendo válido hasta que expire (7 días). Alguien con el token podría seguir usándolo | Activar `django-rest-framework-simplejwt` blacklist: `BLACKLIST_AFTER_ROTATION: True` + agregar `rest_framework_simplejwt.token_blacklist` a `INSTALLED_APPS` |
| **SECRET_KEY segura en producción** | El `.env` de desarrollo usa una clave insegura (`django-insecure-dev-key-...`) | Generar una clave de al menos 64 caracteres aleatorios con `python -c "import secrets; print(secrets.token_hex(64))"` y configurarla en el entorno de producción |
| **HTTPS obligatorio** | En desarrollo se usa HTTP plano. Los tokens JWT viajan sin cifrar en la red | Configurar un proxy inverso (nginx) con certificado SSL/TLS en producción. Activar `SECURE_SSL_REDIRECT = True` y `SECURE_HSTS_SECONDS` en `production.py` |

### Media prioridad

| Mejora | Problema actual | Cómo resolverlo |
|--------|----------------|-----------------|
| **Rate limiting en login** | No hay límite de intentos de login. Un atacante puede hacer fuerza bruta sobre contraseñas | Usar `django-ratelimit` o similar para limitar a ~5 intentos por minuto por IP en `/auth/login/` |
| **Token almacenado en localStorage** | `localStorage` es accesible por JavaScript y vulnerable a ataques XSS | Para mayor seguridad, almacenar el access token en memoria (variable JS) y el refresh token en una cookie `HttpOnly`. Requiere cambios en backend y frontend |
| **Validación de tipos de archivo en MinIO** | El backend acepta cualquier archivo como foto o carnet | Agregar validación en el serializer para verificar que solo se suban imágenes/PDFs (`image/*, application/pdf`) y limitar el tamaño máximo |
| **Credenciales MinIO por defecto** | Las credenciales de MinIO (`minio_admin` / `minio_password`) son inseguras y están en texto plano en `docker-compose.yml` | Usar secrets seguros en producción y nunca subir el `.env` al repositorio |

### Baja prioridad (mejoras de auditoría)

| Mejora | Descripción |
|--------|-------------|
| **Log de intentos de login fallidos** | Registrar IPs y emails que fallan al hacer login para detectar ataques |
| **Campo `nombre` obligatorio al registro** | Actualmente se puede registrar sin nombre. Hacerlo requerido mejora la experiencia y permite personalización desde el inicio |
| **Expiración de sesión por inactividad** | El token dura 60 min independientemente de si el usuario está activo. Se podría reducir el lifetime y compensar con silent refresh |

---

## Guía rápida: ¿A qué archivo voy si quiero...?

| Tarea | Archivo(s) a modificar |
|-------|------------------------|
| Cambiar los permisos de un endpoint | `core/permissions.py` (crear permiso) + `apps/.../interfaces/views.py` (aplicarlo) |
| Agregar un campo nuevo a mascotas | `apps/mascotas/infrastructure/models.py` → `apps/mascotas/interfaces/serializers.py` → migraciones → `src/features/mascotas/api/mascotasApi.ts` → formularios |
| Cambiar qué datos viajan en el JWT | `apps/usuarios/interfaces/serializers.py` → `CustomTokenObtainPairSerializer` |
| Modificar el tiempo de expiración del token | `config/settings/base.py` → `SIMPLE_JWT` → `ACCESS_TOKEN_LIFETIME` |
| Cambiar dónde se almacenan las fotos | `config/settings/base.py` → configuración AWS/MinIO + `DEFAULT_FILE_STORAGE` |
| Agregar una nueva ruta en el frontend | `src/router/AppRouter.tsx` |
| Cambiar el comportamiento global ante un 401 | `src/shared/api/httpClient.ts` |
| Modificar la validación de un formulario | El `schema` de zod en la página correspondiente (ej. `RegistrarFamiliaPage.tsx`) |
| Agregar un nuevo estado de mascota | `apps/mascotas/infrastructure/models.py` → `ESTADO_CHOICES` → migración → frontend `ESTADO_LABEL` en los componentes |
