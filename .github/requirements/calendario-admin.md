# Requerimiento: Vista de Calendario de Vacunación para el Administrador (Frontend)

## Descripción General

Actualmente el **ADMIN** puede acceder al calendario de vacunación de una adopción con la ruta `/adopciones/:adopcionId/calendario/` (misma vista que la familia). Sin embargo, no existe una vista de **listado consolidado** que permita al administrador:

1. Ver **todos los calendarios activos** (de todas las adopciones realizadas) en un solo lugar.
2. Filtrar por mascota, familia, especie o estado de vacunación.
3. Identificar rápidamente calendarios con vacunas **vencidas** o **próximas** sin entrar a cada adopción.
4. Navegar al detalle del calendario de cada mascota adoptada.

## Problema / Necesidad

1. **Sin panel de control para el admin:** El admin debe navegar adopción por adopción para ver el estado de vacunación, lo cual no es escalable.
2. **Sin alertas de vencimiento:** No hay una vista que resalte mascotas con vacunas vencidas.
3. **Flujo de acceso indirecto:** Para llegar al calendario, el admin debe pasar primero por la lista de adopciones, lo que hace el flujo poco eficiente.

## Solución Propuesta

### Nueva página: `CalendariosAdminPage` (`/calendarios`)

Vista exclusiva para ADMIN que muestra un listado de tarjetas, una por adopción, con:

| Campo visible | Detalle |
|---|---|
| Foto + Nombre de mascota | De la relación `adopcion → solicitud → mascota` |
| Especie y raza | Información de la mascota |
| Nombre de familia | `adopcion → solicitud → familia → nombre_familia` |
| Fecha de adopción | `adopcion.fecha_adopcion` |
| Resumen de vacunación | X completadas / Y total; badge de alerta si hay vencidas |
| Botón "Ver calendario" | Navega a `/adopciones/:adopcionId/calendario/` |

### Filtros
- Por especie (`PERRO`, `GATO`, `CONEJO`)
- Por estado del calendario: `Al día` (sin vencidas), `Con vencidas`, `Completado` (todas aplicadas)

### Acceso
- Ruta: `/calendarios`
- Solo rol ADMIN (protegida con `AdminRoute`)
- Entrada desde la navbar de admin y desde el dashboard de admin

## Criterios de Aceptación (Alto Nivel)

1. Solo el ADMIN accede a `/calendarios`; la FAMILIA recibe redirect.
2. Se listan todas las adopciones con su resumen de vacunación.
3. Las adopciones con vacunas vencidas se resaltan con un indicador visual (ej. badge rojo).
4. Los filtros reducen correctamente el listado mostrado.
5. El botón "Ver calendario" navega al detalle correcto de cada adopción.
6. Si no hay adopciones registradas, se muestra un `EmptyState` con mensaje apropiado.
7. La página tiene el `NavBar` y el estilo visual consistente con el resto del sistema.
