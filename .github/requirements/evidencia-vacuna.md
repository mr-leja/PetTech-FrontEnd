# Requerimiento: Evidencia fotográfica de vacuna aplicada (Frontend)

## Descripción General

En la sección de **Calendario de Vacunación** (`CalendarioVacunacionPage`), el usuario familia puede marcar cada vacuna como aplicada adjuntando una foto del comprobante (carnet de vacunas físico, factura veterinaria, etc.). Actualmente la funcionalidad de subida **ya existe en la vista de la familia** pero presenta problemas de UX: no hay validación de tipo/tamaño de archivo, no se muestra feedback de error detallado, y el botón no es accesible para el rol ADMIN.

Se requiere:
1. Validar el archivo antes de enviarlo (tipo imagen, máximo 5 MB).
2. Mostrar mensajes de error descriptivos en español al usuario.
3. Permitir al **ADMIN** visualizar el comprobante subido por la familia (solo lectura, sin poder subirlo).
4. Mostrar un indicador visual claro cuando la vacuna tiene comprobante adjunto.
5. Comprimir la imagen antes de enviarla al backend (igual que en mascotas).

## Problema / Necesidad

1. **Sin validación de archivo:** Cualquier tipo de archivo puede ser seleccionado; no se valida MIME ni tamaño.
2. **Accesibilidad parcial para ADMIN:** El admin llega al calendario via `/adopciones/:adopcionId/calendario/` pero solo ve el estado "Completada" sin opción de ver el comprobante con claridad.
3. **Sin compresión:** Imágenes pesadas se envían sin procesar, degradando performance.
4. **Falta feedback de error detallado:** El mensaje de error actual es genérico (`'Error al guardar. Intenta de nuevo.'`).

## Solución Propuesta

### Validación de archivo (frontend)
- Tipos permitidos: `image/jpeg`, `image/png`, `image/webp`
- Tamaño máximo: 5 MB
- Mensajes de error en español:
  - `'Solo se permiten imágenes en formato JPG, PNG o WEBP.'`
  - `'La imagen no puede superar 5 MB.'`

### Compresión antes de enviar
- Reutilizar `compressImage()` de `formSchema.ts` (maxPx=1200, quality=0.85).

### Vista admin del comprobante
- En `VacunaRow`, cuando `soloLectura=true` y `entrada.foto_comprobante_url` existe, mostrar un enlace/thumbnail más prominente para ver el comprobante.
- Si no hay comprobante y la vacuna está marcada como completada, mostrar `'Sin comprobante adjunto'` en texto secundario.

## Criterios de Aceptación (Alto Nivel)

1. Al seleccionar un archivo que no sea imagen → mensaje de error en español, sin enviar al backend.
2. Al seleccionar un archivo > 5 MB → mensaje de error en español, sin enviar al backend.
3. Al confirmar con imagen válida → la imagen se comprime antes de enviarse.
4. El ADMIN ve el botón/enlace "Ver comprobante" si la vacuna tiene foto adjunta.
5. El ADMIN NO ve el formulario de subida (solo lectura).
6. Si la vacuna está completada sin comprobante, el ADMIN ve indicador visual de ausencia.
