# Historias de Usuario
## Definition of Ready (DoR)

Una historia de usuario está lista para entrar a un sprint cuando:

- Está redactada en formato **Como / Quiero / Para**
- Tiene **criterios de aceptación en Gherkin**, incluyendo:
  - al menos un escenario de flujo exitoso (happy path)
  - escenarios de validación de datos o reglas de negocio
  - al menos un escenario edge case (cuando aplique)
- El objetivo de negocio es claro
- Los datos requeridos están definidos (ej: edad, especie, estado, etc.)
- Las reglas de negocio son claras, por ejemplo:
 - validar disponibilidad de mascota
  - no permitir duplicados
  - requerir mayoría de edad
- El flujo funcional está claro (inicio → acción → resultado)
- Tiene una estimación en Story Points
- Tiene un tamaño adecuado (puede completarse dentro de un sprint)
---

# Definition of Done (DoD)

Una historia de usuario se considera terminada cuando:

- Cumple completamente todos los **criterios de aceptación definidos**
- El flujo funcional es ejecutable de inicio a fin sin errores
- Las reglas de negocio se respetan correctamente, por ejemplo:
  - no se permiten registros duplicados
  - no se pueden crear solicitudes inválidas
  - los estados (pendiente, aprobada, adopción exitosa) se manejan correctamente
- La información se almacena correctamente en base de datos
- Las relaciones entre entidades están correctamente implementadas:
  - mascota ↔ familia
  - solicitud ↔ estado
  - adopción ↔ calendario
- Se manejan correctamente los errores y validaciones, mostrando mensajes claros al usuario
- El código ha sido revisado (code review)
- La historia cumple el objetivo de negocio definido inicialmente

# Épica 1: Gestion de Mascotas

## HU-01 - Registrar información basica de la mascota

- **Como** administrador
- **Quiero** registrar los datos básicos de una mascota
- **Para** almacenar su información en el sistema

## Criterios de aceptacion 

### feature: Registro de información básica de mascota

### Scenario: Registro exitoso
- **Given**  que el administrador completa los campos obligatorios como nombre, especie, edad, sexo, nivel de energía
- **When** confirma el registro de la mascota
- **Then** el sistema almacena los datos de la mascota

### Scenario: Validación de campos obligatorios
- **Given** que el administrador deja vacíos campos obligatorios (como la edad o la especie)
- **When** intenta guardar la mascota
- **Then** el sistema debe mostrar un mensaje de error destacando los campos faltantes
- **And** no debe crear el registro en la base de datos

### Story Points HU-01
  - 5 puntos de estimacion
     registro completo con validaciones y almacenamiento en base de datos
---

## HU-02 – Registrar información de salud

 - **Como** administrador
 - **Quiero** registrar el estado de salud de la mascota
 - **Para** tener control sobre vacunas y esterilización

## Criterios de aceptación

### feature: Registro de informacion médica de la mascota

### Scenario: Registro de información de salud
- **Given** que el administrador ingresa datos de salud
- **When** guarda la información
- **Then** el sistema la almacena correctamente

### Scenario: Intento de registro sin seleccionar el estado de vacunación de la mascota
- **Given** que el administrador  deja el campo de historial de vacunas sin completar
- **When** intenta guardar la información de salud
- **Then** el sistema muestra un mensaje indicando que el historial de vacunación es un dato requerido
- **And** no almacena el registro incompleto

### Scenario: Registro con fecha de vacunación futura
- **Given** que el administrador ingresa información de salud de la mascota
- **And** registra una fecha de vacunación mayor a la fecha actual
- **When** intenta guardar la información
- **Then** el sistema rechaza la operación
- **And** muestra un mensaje indicando que la fecha de vacunación no puede ser futura


### Story Points HU-02
  - 3 puntos de estimacion
     Registro de información de salud con almacenamiento
 ---    

## HU-03 - Subir fotos de la mascota

- **Como** administrador
- **Quiero** subir una fotografía de la mascota
- **Para** mejorar su visualización en la plataforma

## Criterios de aceptacion 

### feature: Carga de fotografía de mascota

### Scenario: Carga de imagen válida
- **Given**  que el administrador selecciona una imagen válida
- **When** la carga en el formulario
- **Then** el sistema la almacena correctamente

### Scenario: Validación de formato de imagen incorrecto
- **Given**  que el administrador intenta subir un archivo que no es una imagen (ej. un .pdf o .docx)
- **When** intenta procesar el registro
- **Then** el sistema debe notificar que el formato de archivo no es compatible

### Story Points HU-03
  - 3 puntos de estimacion
     Funcionalidad complementaria: carga y validación de imágenes
---

# Épica 2: Gestion de familias

## HU-04 - Registrar información básica de familia

- **Como** familia adoptante
- **Quiero** registrar mi información personal
- **Para** crear mi perfil en el sistema

## Criterios de aceptacion

### feature: Registro exitoso de familia adoptante

### Scenario: Registro exitoso con información completa
  - **Given** que la familia ingresa datos personales válidos y completos como nombre, apellido, número de identificación y edad
  - **When** completa el registro
  - **Then** la información queda almacenada correctamente

### Scenario: Validación de datos obligatorios
  - **Given** que la familia omite datos personales obligatorios (numero de identificacion o edad)
  - **When**  intenta registrarse
  - **Then**  el sistema rechaza el registro
  - **And** muestra los campos faltantes

### Scenario: Validación de mayoría de edad
  - **Given**  que la familia ingresa una edad menor a 18
  - **When** intenta completar el registro
  - **Then** el sistema rechaza el registro
  - **And** informa que debe ser mayor de edad

### Story Points HU-04
  - 5 puntos
     registro de información con validaciones (datos obligatorios y mayoría de edad) y almacenamiento en base de datos

---

## HU-05 - Registrar condiciones del hogar y experiencia

- **Como** familia adoptante
- **Quiero** registrar las condiciones de mi hogar y mi experiencia con mascotas
- **Para** facilitar el proceso de evaluación para adopción

## Criterios de aceptacion

### feature: Registro exitoso de experiencia y condiciones del hogar

### Scenario: Registro de condiciones del hogar
  - **Given** que la familia ingresa información del hogar y experiencia
  - **When** guarda los datos
  - **Then** el sistema almacena la información correctamente

### Scenario: Intento de registro sin campos obligatorios
- **Given** que la familia no selecciona el tipo de vivienda o no indica el tamaño del hogar
- **When** intenta guardar la información
- **Then** el sistema informa que los campos de tipo de vivienda y tamaño del hogar son obligatorios
- **And** no actualiza el perfil con información incompleta

### Scenario: Registro duplicado
- **Given** que la familia adoptante ya tiene registrada su información
- **When** intenta registrar nuevamente esta información como un nuevo registro
- **Then** el sistema rechaza el registro por duplicidad
- **And** se informa que el registro ya existe

### Scenario: Actualizacion de la información
- **Given** que la familia adoptante esta previamente registrada
- **When** modifica la información existente
- **Then** el sistema actualiza correctamente la información del perfil

### Story Points HU-05
  -  3 puntos
     Registro de condiciones del hogar y experiencia con almacenamiento. Funcionalidad específica, con validaciones básicas y baja complejidad

---

# Épica 3: Visualización de Mascotas

## HU-06   - Ver listado de mascotas

- **Como** familia adoptante
- **Quiero** ver las mascotas disponibles
- **Para** explorar opciones de adopción

## Criterios de aceptacion

### feature: Visualización del listado de mascotas disponibles

 ### Scenario: Visualización de mascotas disponibles
  - **Given** que existen mascotas registradas en el sistema
  - **When** se consulta el listado de mascotas
  - **Then** el sistema muestra las mascotas disponibles para adopción

  ### Scenario: Exclusión de mascotas no disponibles
  - **Given** que existen mascotas con diferentes estados de disponibilidad
    - **When** se consulta el listado de mascotas
  - **Then** el sistema incluye únicamente mascotas disponibles

### Scenario: Información relevante en el listado
  - **Given** que existen mascotas disponibles para adopción
  - **When** se consulta el listado de mascotas
  **Then** cada mascota presenta la información necesaria para su evaluación básica

### Scenario: Visualización cuando no hay mascotas disponibles
  - **Given** que no existen mascotas disponibles para adopción
  - **When** se consulta el listado de mascotas
  - **Then** el sistema informa que no hay mascotas disponibles

  ### Story Points HU-06
    3 puntos 
     Visualización de listado con filtro por disponibilidad
---

## HU-07 – Ver detalle de mascota

- **Como** familia adoptante
- **Quiero** ver el detalle de una mascota
- **Para** conocer sus características antes de solicitar adopción

## Criterios de aceptación:

### feature: Visualización de la Informacion de una mascota

### Scenario: Visualización del detalle de una mascota
 - **Given** que la familia selecciona una mascota del listado
 - **When** accede a su detalle
 - **Then** el sistema muestra la información completa de la mascota

### Scenario: Visualización de fotografías
 - **Given** que la familia accede al detalle de una mascota
 - **When** existen imágenes asociadas
 - **Then** el sistema muestra las fotos de la mascota

### Scenario: Visualización de la informacion de salud de la mascota
 - **Given** que la familia accede al detalle de una mascota
 - **When** la mascota tiene información de salud registrada
 - **Then** el sistema muestra su historial básico

 ### Story Points HU-07
    - 5 puntos
    Visualización de detalle con más información (datos, fotos e historial). Mayor alcance que el listado
---

# Épica 4: Solicitud y Matching

## HU-08 – Solicitar adopción

- **Como** familia adoptante
- **Quiero** enviar una solicitud de adopción desde la tarjeta de una mascota disponible
- **Para** expresar mi interés formal en adoptarla

## Criterios de aceptación

### feature: Solicitud de adopción

### Scenario: Solicitud exitosa sobre mascota disponible
- **Given** que la familia adoptante visualiza el listado de mascotas
- **And** existe una mascota con estado "disponible"
- **When** hace clic en "Solicitar adopción" y confirma
- **Then** el sistema registra la solicitud con estado "pendiente"
- **And** el estado de la mascota cambia automáticamente a "en proceso"
- **And** el sistema muestra un mensaje de confirmación

### Scenario: La solicitud no se aprueba automáticamente
- **Given** que la familia adoptante ha enviado una solicitud de adopción
- **When** la solicitud es registrada en el sistema
- **Then** el estado de la solicitud queda como "pendiente"
- **And** la solicitud no debe estar ni en estado aprobado ni rechazado

### Scenario: Mascota en proceso solo visible para la familia solicitante
- **Given** que una mascota ha pasado a estado "en proceso" por una solicitud de la familia A
- **When** la familia B consulta el listado de mascotas
- **Then** la mascota con estado "en proceso" no aparece en el listado de la familia B
- **And** la familia A sí puede ver su mascota en proceso en su listado

### Scenario: Intento de solicitud sobre una mascota no disponible
- **Given** una mascota con estado distinto a "disponible"
- **When** la familia adoptante intenta enviar una solicitud de adopción
- **Then** el sistema rechaza la solicitud
- **And** notifica que la mascota no está disponible para adopción

### Scenario: Familia sin perfil intenta solicitar adopción
- **Given** que un usuario autenticado no tiene perfil de familia registrado
- **When** intenta crear una solicitud de adopción
- **Then** el sistema rechaza la operación
- **And** informa que debe completar el perfil de familia antes de solicitar

### Story Points HU-08
  - 3 puntos de estimacion
    Flujo CRUD con cambio de estado en cascada, filtro de visibilidad y validaciones de negocio.

--- 

## HU-09 – Consultar solicitudes de adopción (admin)

**Como** administrador
**Quiero** visualizar el listado y detalle de todas las solicitudes de adopción
**Para** analizar la viabilidad de cada adopción antes de tomar una decisión

## Criterios de aceptación

### feature: Consulta de solicitudes de adopción

### Scenario: Visualización del listado de solicitudes
**Given** que existen solicitudes registradas en el sistema
**When** el administrador accede al módulo de gestión de solicitudes
**Then** el sistema muestra el listado con estado, nombre de la mascota y nombre de la familia para cada solicitud

### Scenario: Visualización de información completa de una solicitud
**Given** que existe una solicitud de adopción
**When** el administrador accede a su detalle
**Then** el sistema muestra la información completa de la mascota (nombre, especie, foto)
**And** muestra los datos del adoptante (nombre, teléfono, ciudad, condiciones del hogar)
**And** muestra el mensaje opcional enviado por la familia

### Scenario: Filtro por estado de solicitud
**Given** que existen solicitudes con diferentes estados (pendiente, aprobada, rechazada)
**When** el administrador aplica un filtro por estado
**Then** el sistema muestra únicamente las solicitudes que coinciden con el filtro seleccionado

### Scenario: Intento de acceso a una solicitud inexistente
**Given** que un administrador intenta acceder al detalle de una solicitud mediante un ID que no existe
**When** el sistema procesa la petición
**Then** el sistema informa que la solicitud consultada no existe en el sistema

### Scenario: Familia consulta sus propias solicitudes
**Given** que una familia adoptante ha realizado solicitudes de adopción
**When** consulta el listado de sus solicitudes
**Then** el sistema muestra únicamente sus propias solicitudes
**And** no puede ver solicitudes de otras familias

### Story Points HU-09
  - 3 puntos de estimacion
    Flujo de visualización con control de acceso por rol y datos relacionados de dos entidades.

---

## HU-10 – Registrar decisión sobre solicitud

**Como** administrador
**Quiero** aprobar o rechazar una solicitud de adopción
**Para** controlar el proceso de asignación de mascotas y registrar adopciones realizadas

## Criterios de aceptación

### feature: Gestión de decisión de solicitud

### Scenario: Aprobación de solicitud
**Given** que el administrador ha revisado la solicitud con estado "pendiente"
**When** hace clic en el botón "Aprobar"
**Then** el sistema registra la solicitud como "aprobada"
**And** la mascota cambia automáticamente a estado "adoptado"
**And** se crea un registro en el módulo de adopciones realizadas
**And** el contador de adopciones realizadas del adoptante se incrementa

### Scenario: Rechazo de solicitud
**Given** que el administrador ha revisado la solicitud con estado "pendiente"
**When** hace clic en el botón "Rechazar"
**Then** el sistema registra la solicitud como "rechazada"
**And** la mascota vuelve automáticamente a estado "disponible"
**And** la mascota vuelve a ser visible para todos los adoptantes

### Scenario: Actualización de contadores del adoptante al aprobar
**Given** que una solicitud de adopción es aprobada
**When** el adoptante consulta su perfil
**Then** el contador de "adopciones en proceso" disminuye en uno
**And** el contador de "adopciones realizadas" aumenta en uno

### Scenario: Intento de cambiar una solicitud ya finalizada
**Given** que existe una solicitud con estado "aprobada" o "rechazada"
**When** el administrador intenta realizar una acción de aprobación o rechazo sobre la solicitud
**Then** el sistema rechaza la operación
**And** muestra un mensaje indicando que la solicitud ya tiene una decisión final

### Scenario: Registro en el módulo de adopciones
**Given** que una solicitud es aprobada
**When** el administrador consulta el módulo de adopciones realizadas
**Then** aparece un nuevo registro con los datos de la mascota, la familia y la fecha de adopción

### Story Points HU-10
  - 5 puntos de estimacion
    Lógica de cambio de estado en cascada: solicitud → mascota → adopción registrada + actualización de contadores del adopante.

---
## HU-11 – Sugerir alternativa de adopción

**Como** administrador  
**Quiero** sugerir una mascota alternativa a una familia  
**Para** mejorar la probabilidad de éxito en la adopción  

## Criterios de aceptacion

## feature: Sugerencia de mascota alternativa  

### Scenario: Registro de sugerencia  
**Given** que el administrador identifica una mejor opción  
**When** asigna una mascota sugerida a la familia  
**Then** el sistema registra la sugerencia de adopción  

### Scenario: Validación de reglas de compatibilidad al sugerir
**Given** que el administrador consulta la información de una familia y las mascotas disponibles
**When** el sistema analiza los datos (tamaño de hogar, tiempo de soledad, presencia de niños e ingresos) contra el perfil de la mascota
**Then** el sistema debe mostrar indicadores de compatibilidad basados en las reglas de negocio
**And** el administrador puede seleccionar la mascota sugerida basándose en el mayor porcentaje de afinidad detectado

### Scenario: Intento de sugerir una mascota no disponible
**Given** que el administrador selecciona una mascota que ya está en proceso de adopción
**When** registra la sugerencia para esa familia
**Then** el sistema invalida la operación y retorna un mensaje informativo donde se indica que la mascota no se encuentra disponible para adopción

### Story Points HU-11
  - 3 puntos de estimacion
    Logica no incluye tablas adyacentes unicamente incluye un registro en una tabla como sugerencia


# Épica 5: Confirmación de Adopción

## HU-12 – Confirmar adopción

**Como** administrador  
**Quiero** confirmar una adopción  
**Para** registrar que la mascota ha encontrado una familia  

## Criterios de aceptación

### feature: Confirmación de adopción

### Scenario: Confirmación exitosa de adopción
**Given** que existe una solicitud de adopción con estado aprobada  
**When** el administrador confirma la adopción  
**Then** el estado de la solicitud cambia a adopción exitosa  
**And** el sistema registra automáticamente la fecha de adopción  
**And** la mascota queda vinculada a la familia en el registro de adopciones  
**And** el estado de la mascota se actualiza a adoptada  

### Scenario: Intento de confirmar una solicitud que no está aprobada
**Given** que existe una solicitud con estado pendiente o rechazada  
**When** el administrador intenta confirmar la adopción  
**Then** el sistema rechaza la operación  
**And** muestra un mensaje indicando que solo se pueden confirmar solicitudes aprobadas  

### Scenario: Intento de confirmar una solicitud que ya fue confirmada
**Given** que existe una solicitud con estado de adopción exitosa  
**When** el administrador intenta confirmar la adopción nuevamente  
**Then** el sistema rechaza la operación  
**And** muestra un mensaje indicando que la solicitud ya fue confirmada

### Story Points HU-12
  - 3 puntos de estimacion
    Cambio de estado , manejo de fechas , relacion de dos tablas logica directa
---
    
## HU-13 – Visualizar adopciones realizadas

**Como** administrador 
**Quiero** ver el historial de adopciones  
**Para** hacer seguimiento de adopciones exitosas  

## Criterios de aceptación

### feature: Visualización de adopciones realizadas

### Scenario: Acceso a la sección de adopciones realizadas
**Given** que el administrador accede al sistema  
**When** navega a la sección "Adopciones realizadas"  
**Then** el sistema muestra la sección de historial de adopciones  

### Scenario: Visualización de registros históricos
**Given** que el administrador se encuentra en la sección de adopciones realizadas  
**When** consulta el historial  
**Then** el sistema muestra los registros de adopciones exitosas  

### Scenario: Filtrado de adopciones por usuario
**Given** que el administrador visualiza el historial de adopciones  
**When** aplica un filtro por usuario  
**Then** el sistema muestra únicamente las adopciones asociadas a ese usuario  

### Story Points HU-13
  - 5 puntos de estimacion
    logica de filtro complejo + paginacion

--- 

# Épica 6: Calendario de Vacunación

## HU-14 – Generar calendario de vacunas

**Como** administrador  
**Quiero** generar un calendario inicial de vacunación  
**Para** orientar al adoptante en el cuidado de la mascota  

## Criterios de aceptación

### feature: Generación de calendario de vacunación

### Scenario: Generación de calendario de vacunación al confirmar una adopción
- **Given** que existe una adopción confirmada
- **When** la adopción es registrada como exitosa
- **Then** el sistema genera un calendario de vacunación para la mascota
- **And** asocia el calendario a la adopción correspondiente

### Scenario: Generación de calendario basada en características de la mascota
- **Given** que una mascota adoptada tiene información de especie, edad e historial de Vacunación
- **When** se genera el calendario de vacunación
- **Then** el sistema define las vacunas correspondientes según dichas características

### Scenario: Asignación de fechas sugeridas en el calendario de vacunación
- **Given** que existen vacunas definidas para una mascota adoptada
- **When** el calendario de vacunación es generado
- **Then** el sistema asigna fechas sugeridas para cada vacuna

### Story Points HU-14
  - 8 puntos de estimacion
    logica de negocio importante filtro de vacunas disparo de eventos se debe probar el flujo con diferentes datos como especie, edad, nivel de energia, 

--- 

## HU-15 – Consultar calendario

 - **Como** familia adoptante  
 - **Quiero** ver el calendario de vacunación  
 - **Para** cumplir con los cuidados de salud de la mascota  

## Criterios de aceptación

### feature: visualizacion del calendario de vacunación

### Scenario: Asociación del calendario a la adopción
**Given** que la familia adoptante ha completado una adopción  
**When** accede a la información de su mascota  
**Then** el sistema muestra el calendario de vacunación con sus fechas correspondientes 

### Scenario: Consulta de calendario para una adopción no confirmada
  **Given** que la familia adoptante tiene una solicitud de adopción en estado "pendiente"
  **And** la mascota no ha sido entregada a la familia
  **When** se consulta la información de la mascota
  **Then** el sistema no muestra el calendario de vacunación

### Scenario: Acceso a calendario sin tener una adopción registrada
  **Given** que el usuario no tiene una adopción registrada
  **When** intenta acceder a la información de una mascota
  **Then** el sistema deniega el acceso al calendario de vacunación

### Story Points HU-15
  - 3 puntos de estimacion
    Unicamente flujo de lectura no hay logica por detras