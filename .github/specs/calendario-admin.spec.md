---
id: SPEC-004
status: IMPLEMENTED
feature: calendario-admin
created: 2026-04-08
updated: 2026-04-08
author: spec-generator
version: "1.0"
related-specs: [SPEC-003]
---

# Spec: Vista de Calendarios de Vacunación para el Administrador (Frontend)

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción

Nueva página exclusiva para el rol ADMIN: `CalendariosAdminPage` en la ruta `/calendarios`. Muestra el listado consolidado de todos los calendarios de vacunación activos (una tarjeta por adopción) con resumen del estado, filtros y acceso rápido al detalle.

Fuente: `MVP_FrontEnd/.github/requirements/calendario-admin.md`

### Historias de Usuario

#### HU-20: Listar todos los calendarios de vacunación como admin

```
Como:        Administrador
Quiero:      ver en una sola página todos los calendarios de vacunación de mascotas adoptadas
Para:        tener control y registro consolidado sin navegar adopción por adopción

Prioridad:   Alta
Estimación:  M
Dependencias: SPEC-004 backend (endpoint GET /api/v1/calendarios/)
Capa:        Frontend
```

**Happy Path**
```gherkin
CRITERIO-20.1: Listado cargado correctamente
  Dado que:  el ADMIN navega a /calendarios
  Cuando:    la página carga
  Entonces:  se muestra una tarjeta por adopción con:
             - Foto y nombre de la mascota
             - Especie y raza
             - Nombre de la familia adoptante
             - Fecha de adopción
             - "X de Y vacunas completadas"
             - Badge de estado: "Al día" | "Vacuna(s) vencida(s)" | "Completado"
             - Botón "Ver calendario"
```

**Edge Cases**
```gherkin
CRITERIO-20.2: Sin adopciones registradas
  Dado que:  no existen adopciones en el sistema
  Cuando:    el ADMIN navega a /calendarios
  Entonces:  se muestra EmptyState con mensaje 'No hay calendarios de vacunación aún.'

CRITERIO-20.3: Acceso no autorizado
  Dado que:  un usuario FAMILIA intenta acceder a /calendarios
  Entonces:  es redirigido a /dashboard
```

#### HU-21: Filtrar calendarios por especie y estado

```
Como:        Administrador
Quiero:      filtrar los calendarios por especie y por estado de vacunación
Para:        identificar rápidamente las mascotas que requieren atención

Prioridad:   Media
Estimación:  S
Dependencias: HU-20
Capa:        Frontend
```

**Happy Path**
```gherkin
CRITERIO-21.1: Filtro por especie
  Dado que:  el ADMIN selecciona "Perro" en el filtro de especie
  Entonces:  solo se muestran tarjetas de mascotas con especie=PERRO

CRITERIO-21.2: Filtro por estado
  Dado que:  el ADMIN selecciona "Con vencidas" en el filtro de estado
  Entonces:  solo se muestran calendarios donde hay al menos una vacuna vencida

CRITERIO-21.3: Limpiar filtros
  Dado que:  el ADMIN tenía un filtro activo
  Cuando:    selecciona "Todas las especies" y "Todos los estados"
  Entonces:  se muestran todos los calendarios nuevamente
```

#### HU-22: Navegar al detalle del calendario desde el listado

```
Como:        Administrador
Quiero:      hacer clic en "Ver calendario" en una tarjeta
Para:        acceder al detalle completo de vacunación de esa mascota

Prioridad:   Alta
Estimación:  XS
Dependencias: HU-20
Capa:        Frontend
```

**Happy Path**
```gherkin
CRITERIO-22.1: Navegación al detalle
  Dado que:  el ADMIN está en /calendarios
  Cuando:    hace clic en "Ver calendario" de la mascota "Luna"
  Entonces:  navega a /adopciones/<adopcion_id>/calendario/
  Y:         se muestra el calendario completo de Luna
```

### Reglas de Negocio

| ID | Regla |
|---|---|
| RN-01 | Solo rol ADMIN puede acceder a `/calendarios` |
| RN-02 | Los datos se obtienen del endpoint `GET /api/v1/calendarios/` (SPEC-004 backend) |
| RN-03 | Badge "Vacuna(s) vencida(s)" se muestra si `vacunas_vencidas > 0` |
| RN-04 | Badge "Completado" si `vacunas_completadas == total_vacunas` |
| RN-05 | Badge "Al día" si no hay vencidas y hay pendientes |
| RN-06 | Los filtros envían `?especie=` y `?estado_calendario=` al backend |
| RN-07 | La página usa `refetchInterval: 60_000` para actualizarse automáticamente |

---

## 2. DISEÑO

### 2.1 Nueva API call

**Archivo nuevo:** `src/features/adopciones/api/calendariosAdminApi.ts`

```typescript
export interface ResumenCalendario {
  id: number
  adopcion_id: number
  fecha_adopcion: string
  mascota_id: number
  mascota_nombre: string
  mascota_especie: 'PERRO' | 'GATO' | 'CONEJO'
  mascota_raza: string
  mascota_foto_url: string | null
  familia_nombre: string
  total_vacunas: number
  vacunas_completadas: number
  vacunas_vencidas: number
  estado_calendario: 'al_dia' | 'con_vencidas' | 'completado'
}

export interface CalendariosResponse {
  count: number
  next: string | null
  previous: string | null
  results: ResumenCalendario[]
}

export const calendariosAdminApi = {
  listar: (params?: { especie?: string; estado_calendario?: string; page_size?: number }) =>
    httpClient
      .get<CalendariosResponse>('/calendarios/', { params })
      .then((r) => r.data),
}
```

### 2.2 Nueva página

**Archivo nuevo:** `src/features/adopciones/pages/CalendariosAdminPage.tsx`

**Estructura de la página:**
```
<NavBar />
<main>
  <header>
    <h1>Calendarios de vacunación</h1>
    <p>{count} adopciones activas</p>
  </header>

  <filtros>
    <select filtroEspecie>  // Todas | Perro | Gato | Conejo
    <select filtroEstado>   // Todos | Al día | Con vencidas | Completado
  </filtros>

  {isLoading && <Spinner />}
  {calendarios.length === 0 && <EmptyState />}

  <grid>
    {calendarios.map(c => <CalendarioCard key={c.id} resumen={c} />)}
  </grid>
</main>
```

**Componente `CalendarioCard`** (interno a la página o en `components/`):
```
┌─────────────────────────────────────────────┐
│ [foto mascota 48px]  nombre  especie • raza  │
│                      Familia: nombre_familia  │
│                      Adoptado: 26 mar 2026   │
│                                              │
│  ████████░░  5 de 8 vacunas completadas     │
│  [badge estado]                              │
│                      [Ver calendario →]      │
└─────────────────────────────────────────────┘
```

**Badge de estado:**
```typescript
function BadgeEstado({ estado }: { estado: string }) {
  if (estado === 'completado')
    return <span className="badge-green">✓ Completado</span>
  if (estado === 'con_vencidas')
    return <span className="badge-red">⚠ Vacuna(s) vencida(s)</span>
  return <span className="badge-blue">· Al día</span>
}
```

### 2.3 Ruta en AppRouter

```typescript
// En AdminRoute:
<Route path="/calendarios" element={<CalendariosAdminPage />} />
```

### 2.4 Entrada en NavBar (admin)

Agregar ítem "Calendarios" en la navegación del admin apuntando a `/calendarios`.

### 2.5 Query con filtros

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['calendarios', filtroEspecie, filtroEstado],
  queryFn: () => calendariosAdminApi.listar({
    ...(filtroEspecie && { especie: filtroEspecie }),
    ...(filtroEstado && { estado_calendario: filtroEstado }),
    page_size: 100,
  }),
  enabled: isAdmin,
  refetchInterval: 60_000,
  staleTime: 0,
})
```

---

## 3. LISTA DE TAREAS

### Frontend (`MVP_FrontEnd`)

- [ ] Crear `src/features/adopciones/api/calendariosAdminApi.ts` con interfaz `ResumenCalendario` y `calendariosAdminApi.listar()`
- [ ] Crear `src/features/adopciones/pages/CalendariosAdminPage.tsx` con listado, filtros y `EmptyState`
- [ ] Crear componente `CalendarioCard` dentro de la página (o en `components/CalendarioCard.tsx`)
- [ ] Crear función/componente `BadgeEstado` para el estado del calendario
- [ ] Agregar ruta `/calendarios` en `AppRouter.tsx` dentro de `AdminRoute`
- [ ] Agregar entrada "Calendarios" en `NavBar` para rol ADMIN
- [ ] Agregar acceso desde el dashboard del admin (link en la sección de stats de adopciones)

### QA

- [ ] `/calendarios` con rol ADMIN → lista de tarjetas cargada
- [ ] `/calendarios` con rol FAMILIA → redirect a /dashboard
- [ ] Filtro por especie PERRO → solo tarjetas de perros
- [ ] Filtro estado "con_vencidas" → solo tarjetas con badge rojo
- [ ] Tarjeta sin adopciones → EmptyState visible
- [ ] Clic "Ver calendario" → navega a /adopciones/:id/calendario/
- [ ] Badge "Completado" cuando total_vacunas == vacunas_completadas
- [ ] Badge "Al día" cuando vacunas_vencidas == 0 y hay pendientes
- [ ] Badge "Vencida(s)" cuando vacunas_vencidas > 0
