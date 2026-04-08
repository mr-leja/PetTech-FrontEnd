---
id: SPEC-003
status: IMPLEMENTED
feature: evidencia-vacuna
created: 2026-04-08
updated: 2026-04-08
author: spec-generator
version: "1.0"
related-specs: [SPEC-001]
---

# Spec: Evidencia fotográfica de vacuna aplicada

> **Estado:** `DRAFT` → aprobar con `status: APPROVED` antes de iniciar implementación.
> **Ciclo de vida:** DRAFT → APPROVED → IN_PROGRESS → IMPLEMENTED → DEPRECATED

---

## 1. REQUERIMIENTOS

### Descripción

Mejora de la funcionalidad de marcado de vacunas aplicadas en el **Calendario de Vacunación**. Se añade validación de archivo (tipo/tamaño), compresión de imagen, registro del campo `fecha_aplicacion` en el backend, acceso de lectura del comprobante para el ADMIN, y permiso de escritura para que el ADMIN también pueda marcar vacunas como aplicadas.

### Requerimiento de Negocio

Fuentes:
- `MVP_FrontEnd/.github/requirements/evidencia-vacuna.md`
- `MVP_PetTech/.github/requirements/evidencia-vacuna.md`

### Historias de Usuario

#### HU-16: Validar y comprimir foto de comprobante de vacuna

```
Como:        Usuario FAMILIA en el Calendario de Vacunación
Quiero:      recibir mensajes de error claros si subo un archivo inválido
             y que la imagen se comprima antes de enviarse
Para:        evitar errores silenciosos y reducir el tiempo de carga

Prioridad:   Alta
Estimación:  S
Dependencias: compressImage() en formSchema.ts
Capa:        Frontend + Backend
```

**Happy Path**
```gherkin
CRITERIO-16.1: Subir comprobante válido
  Dado que:  la FAMILIA está en el Calendario de Vacunación
  Cuando:    selecciona una imagen JPG/PNG/WEBP de menos de 5 MB
  Y:         hace clic en "Confirmar"
  Entonces:  la imagen se comprime con compressImage()
  Y:         se envía PATCH /api/v1/entradas/<id>/aplicar/ con la imagen comprimida
  Y:         la entrada queda marcada como completada con fecha_aplicacion = hoy
  Y:         el badge cambia a "Completada"
```

**Error Path**
```gherkin
CRITERIO-16.2: Archivo no imagen
  Dado que:  la FAMILIA está en el formulario de comprobante
  Cuando:    selecciona un archivo PDF o ZIP
  Entonces:  se muestra 'Solo se permiten imágenes en formato JPG, PNG o WEBP.'
  Y:         el archivo no se envía al backend

CRITERIO-16.3: Imagen mayor a 5 MB
  Dado que:  la FAMILIA intenta subir una imagen de 6 MB
  Cuando:    selecciona el archivo
  Entonces:  se muestra 'La imagen no puede superar 5 MB.'
  Y:         el archivo no se envía al backend

CRITERIO-16.4: Backend rechaza archivo inválido
  Dado que:  se envía un archivo con tipo MIME no permitido al backend
  Cuando:    el serializer valida foto_comprobante
  Entonces:  el backend retorna HTTP 400
  Y:         la respuesta contiene el mensaje de error en español
```

#### HU-17: Registrar fecha de aplicación de vacuna

```
Como:        Administrador del sistema
Quiero:      que se registre la fecha exacta en que se marcó una vacuna como aplicada
Para:        tener trazabilidad del historial de vacunación de cada mascota adoptada

Prioridad:   Media
Estimación:  XS
Dependencias: HU-16
Capa:        Backend
```

**Happy Path**
```gherkin
CRITERIO-17.1: Fecha de aplicación registrada automáticamente
  Dado que:  se hace PATCH /api/v1/entradas/<id>/aplicar/ exitoso
  Entonces:  el campo fecha_aplicacion de EntradaCalendario es igual a la fecha actual (UTC)
  Y:         la respuesta incluye el campo fecha_aplicacion en formato YYYY-MM-DD
```

#### HU-18: El ADMIN visualiza comprobantes en el calendario

```
Como:        Administrador
Quiero:      ver el comprobante adjunto de cada vacuna aplicada en el calendario
Para:        verificar que las vacunas fueron efectivamente administradas

Prioridad:   Media
Estimación:  XS
Dependencias: HU-16
Capa:        Frontend
```

**Happy Path**
```gherkin
CRITERIO-18.1: Admin ve enlace/thumbnail al comprobante
  Dado que:  el ADMIN navega al calendario de una adopción
  Cuando:    una vacuna tiene foto_comprobante_url != null y completada=true
  Entonces:  se muestra un thumbnail o enlace "Ver comprobante" visible
  Y:         al hacer clic abre la imagen en nueva pestaña

CRITERIO-18.2: Admin ve indicador de vacuna sin comprobante
  Dado que:  el ADMIN navega al calendario de una adopción
  Cuando:    una vacuna tiene completada=true pero foto_comprobante_url es null
  Entonces:  se muestra el texto 'Sin comprobante adjunto' en estilo secundario
```

#### HU-19: El ADMIN puede marcar vacunas como aplicadas

```
Como:        Administrador
Quiero:      poder marcar una vacuna como aplicada desde el calendario
Para:        registrar vacunas aplicadas en clínica sin necesidad de que la familia lo haga

Prioridad:   Baja
Estimación:  S
Dependencias: HU-17
Capa:        Backend + Frontend
```

**Happy Path**
```gherkin
CRITERIO-19.1: Admin marca vacuna como aplicada
  Dado que:  el ADMIN está en el calendario de una adopción
  Cuando:    hace clic en "Marcar como aplicada" y sube comprobante
  Entonces:  se envía PATCH /api/v1/entradas/<id>/aplicar/ con token ADMIN
  Y:         el backend acepta la petición → HTTP 200
  Y:         la entrada queda completada

CRITERIO-19.2: Control de acceso en backend
  Dado que:  se hace PATCH /api/v1/entradas/<id>/aplicar/ con token ADMIN
  Entonces:  el backend procesa la petición sin validar familia propietaria
  Y:         retorna HTTP 200 con la entrada actualizada
```

### Reglas de Negocio

| ID | Regla |
|---|---|
| RN-01 | Tipos de archivo permitidos: `image/jpeg`, `image/png`, `image/webp` |
| RN-02 | Tamaño máximo por archivo: 5 MB |
| RN-03 | La imagen se comprime (maxPx=1200, quality=0.85) antes del envío |
| RN-04 | `fecha_aplicacion` se registra automáticamente con la fecha del servidor (UTC) |
| RN-05 | ADMIN tiene acceso completo de escritura en cualquier entrada de calendario |
| RN-06 | FAMILIA solo puede operar sobre entradas de sus propias adopciones |
| RN-07 | Una vez marcada como completada, una vacuna no puede desmarcarse desde el frontend |

---

## 2. DISEÑO

### 2.1 Cambios de modelo de datos (backend)

#### `EntradaCalendario` — campo nuevo

```python
# apps/adopciones/infrastructure/models.py
fecha_aplicacion = models.DateField(null=True, blank=True)
```

**Migración:** compatible con registros existentes (`null=True`).

### 2.2 Endpoints API

#### `PATCH /api/v1/entradas/<entrada_id>/aplicar/`

**Cambios sobre implementación actual:**

| Aspecto | Antes | Después |
|---|---|---|
| Validación de MIME | No existe | `image/jpeg`, `image/png`, `image/webp` |
| Validación de tamaño | No existe | Máximo 5 MB |
| Campo `fecha_aplicacion` | No existe | Se registra con `date.today()` |
| Acceso ADMIN | HTTP 403 | HTTP 200 (permitido) |

**Request:**
```
PATCH /api/v1/entradas/3/aplicar/
Content-Type: multipart/form-data
Authorization: Bearer <token>

foto_comprobante: <File>
```

**Response 200:**
```json
{
  "id": 3,
  "nombre_vacuna": "Rabia",
  "descripcion": "Antirrábica anual",
  "fecha_sugerida": "2026-04-15",
  "es_refuerzo": false,
  "completada": true,
  "fecha_aplicacion": "2026-04-08",
  "foto_comprobante_url": "https://res.cloudinary.com/..."
}
```

**Response 400 — archivo inválido:**
```json
{"foto_comprobante": "Solo se permiten imágenes JPG, PNG o WEBP."}
```

**Response 400 — archivo demasiado grande:**
```json
{"foto_comprobante": "La imagen no puede superar 5 MB."}
```

**Response 403:**
```json
{"error": "No tienes permiso para modificar esta entrada."}
```

### 2.3 Serializer (backend)

**`MarcarVacunaAplicadaSerializer`** — agregar validaciones:

```python
def validate_foto_comprobante(self, value):
    tipos_permitidos = ['image/jpeg', 'image/png', 'image/webp']
    if value.content_type not in tipos_permitidos:
        raise serializers.ValidationError('Solo se permiten imágenes JPG, PNG o WEBP.')
    if value.size > 5 * 1024 * 1024:
        raise serializers.ValidationError('La imagen no puede superar 5 MB.')
    return value
```

**`EntradaCalendarioSerializer`** — agregar campo:
```python
fecha_aplicacion = serializers.DateField(read_only=True, allow_null=True)
```

### 2.4 Vista (backend)

**`MarcarVacunaAplicadaView`** — control de acceso actualizado:

```python
# Antes: solo familia propietaria
# Después:
if user.rol == 'ADMIN':
    pass  # acceso completo
else:
    # validar familia propietaria (lógica existente)
```

Registrar `fecha_aplicacion`:
```python
entrada.fecha_aplicacion = date.today()
entrada.save()
```

### 2.5 Frontend — cambios en `VacunaRow`

**Validación antes de `setFotoSeleccionada`:**
```typescript
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 5 * 1024 * 1024

const handleFileChange = (e) => {
  const file = e.target.files?.[0] ?? null
  if (file) {
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      setFileError('Solo se permiten imágenes en formato JPG, PNG o WEBP.')
      return
    }
    if (file.size > MAX_SIZE) {
      setFileError('La imagen no puede superar 5 MB.')
      return
    }
    setFileError(null)
  }
  setFotoSeleccionada(file)
  ...
}
```

**Compresión antes de enviar:**
```typescript
const handleConfirmar = async () => {
  if (!fotoSeleccionada) return
  const compressed = await compressImage(fotoSeleccionada)
  mutation.mutate(compressed)
}
```

**Vista ADMIN (soloLectura=true) mejorada:**
- Si `foto_comprobante_url` → thumbnail 48px + enlace "Ver comprobante"
- Si no → `<span className="text-xs text-gray-400">Sin comprobante adjunto</span>`
- El botón "Marcar como aplicada" SE muestra también para ADMIN (quitar `soloLectura` o pasar `soloLectura=false` para ADMIN)

**Nuevo campo en `EntradaCalendario` (tipo frontend):**
```typescript
fecha_aplicacion?: string | null  // 'YYYY-MM-DD'
```

---

## 3. LISTA DE TAREAS

### Backend (`MVP_PetTech`)

- [ ] Agregar campo `fecha_aplicacion = DateField(null=True, blank=True)` a `EntradaCalendario`
- [ ] Crear y aplicar migración `0006_entradacalendario_fecha_aplicacion.py`
- [ ] Agregar `validate_foto_comprobante` en `MarcarVacunaAplicadaSerializer`
- [ ] Agregar `fecha_aplicacion` a `EntradaCalendarioSerializer` (read_only)
- [ ] Actualizar `MarcarVacunaAplicadaView`: permitir ADMIN + registrar `fecha_aplicacion`
- [ ] Actualizar repositorio `CalendarioRepository.marcar_aplicada()` para recibir/guardar `fecha_aplicacion`

### Frontend (`MVP_FrontEnd`)

- [ ] Agregar `fecha_aplicacion?: string | null` a interfaz `EntradaCalendario` en `calendarioApi.ts`
- [ ] Agregar estado `fileError` y validación MIME/tamaño en `VacunaRow.handleFileChange`
- [ ] Mostrar mensaje de `fileError` bajo el input de archivo
- [ ] Importar y llamar `compressImage()` en `handleConfirmar` antes de `mutation.mutate`
- [ ] Mejorar sección `soloLectura`: thumbnail + enlace o indicador de ausencia
- [ ] Pasar `soloLectura={false}` al ADMIN en `CalendarioVacunacionPage` para que pueda marcar vacunas

### QA

- [ ] Caso: subir JPG < 5 MB → éxito
- [ ] Caso: subir PDF → error validación frontend
- [ ] Caso: subir imagen > 5 MB → error validación frontend
- [ ] Caso: ADMIN marca vacuna → éxito HTTP 200
- [ ] Caso: FAMILIA marca vacuna de otra adopción → HTTP 403
- [ ] Caso: backend recibe tipo MIME inválido → HTTP 400
- [ ] Verificar `fecha_aplicacion` en response
- [ ] Verificar thumbnail visible para ADMIN cuando hay comprobante
