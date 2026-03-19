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

# Épica 1: Gestion de Mascotas

## HU-01 - Registrar información basica de la mascota

- **Como** administrador
- **Quiero** registrar los datos básicos de una mascota
- **Para** almacenar su información en el sistema

## Criterios de aceptacion 

### Feature: Registro de información básica de mascota

### Scenario: Registro exitoso

- **Given**  que el administrador del refugio completa los campos obligatorios
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
----

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

#### Scenario: Intento de registro sin seleccionar el estado de vacunación de la mascota
- **Given** que el administrador  deja el campo de historial de vacunas sin completar
- **When** intenta guardar la información de salud
- **Then** el sistema muestra un mensaje indicando que el historial de vacunación es un dato requerido
- **And** no almacena el registro incompleto

#### Scenario: Registro de mascota ya esterilizada
- **Given** que el administrador  marca la mascota como esterilizada
- **When** guarda la información de salud
- **Then** el sistema registra la condición de esterilización de la mascota
- **And** este dato queda disponible como referencia en el proceso de adopción


### Story Points HU-02
  - 3 puntos de estimacion
     Registro de información de salud con almacenamiento
 ---    

## HU-03 - Subir fotos de la mascota

- **Como** administrador
- **Quiero** subir una fotografía de la mascota
- **Para** mejorar su visualización en la plataforma

## Criterios de aceptacion 

### Feature: Carga de fotografía de mascota

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

### Feature: Registro exitoso de familia adoptante

### Scenario: Registro exitoso con información completa
  - **Given** que la familia ingresa datos válidos
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

### Feature: Registro exitoso de experiencia y condiciones del hogar

### Scenario: Registro de condiciones del hogar
  - **Given** que la familia ingresa información del hogar y experiencia
  - **When** guarda los datos
  - **Then** el sistema almacena la información correctamente

#### Scenario: Intento de registro sin campos obligatorios
- **Given** que la familia no selecciona el tipo de vivienda o no indica el tamaño del hogar
- **When** intenta guardar la información
- **Then** el sistema muestra un mensaje con el siguinte texto: Los campos de tipo vivienda son obligatorios
- **And** no actualiza el perfil con información incompleta

### Scenario: Registro duplicado

- **Given** que la familia adoptante ya tiene registrada su información
- **When** intenta registrar nuevamente esta información como un nuevo registro
- **Then** el sistema rechaza el registro por duplicidad
- **And** se informa que el registro ya existe

### Scenario: Edición de condiciones del hogar y experiencia

- **Given** que la familia adoptante esta previamente registrada
- **When** modifica la información existente
- **Then** el sistema actualiza correctamente la información del perfil

### Story Points HU-05
  -  3 puntos
     Registro de condiciones del hogar y experiencia con almacenamiento. Funcionalidad específica, con validaciones básicas y baja complejidad

---

# Épica 3: Visualización de Mascotas

## HU-06 - Ver listado de mascotas

- **Como** familia adoptante
- **Quiero** ver las mascotas disponibles
- **Para** explorar opciones de adopción

## Criterios de aceptacion

### Feature: Visualización del listado de mascotas disponibles

 ### Scenario: Visualización de mascotas disponibles
  **Given** que existen mascotas registradas en el sistema
  **When** se consulta el listado de mascotas
  **Then** el sistema muestra las mascotas disponibles para adopción

  ### Scenario: Exclusión de mascotas no disponibles
  **Given** que existen mascotas con diferentes estados de disponibilidad
  **When** se consulta el listado de mascotas
  **Then** el sistema incluye únicamente mascotas disponibles

### Scenario: Información relevante en el listado
  **Given** que existen mascotas disponibles para adopción
  **When** se consulta el listado de mascotas
  **Then** cada mascota presenta la información necesaria para su evaluación básica

### Scenario: Ausencia de mascotas disponibles
  **Given** que no existen mascotas disponibles para adopción
  **When** se consulta el listado de mascotas
  **Then** el sistema informa que no hay mascotas disponibles

  ### Story Points HU-06
    -3 puntos 
     Visualización de listado con filtro por disponibilidad
---

## HU-07 – Ver detalle de mascota

- **Como** familia adoptante
- **Quiero** ver el detalle de una mascota
- **Para** conocer sus características antes de solicitar adopción

## Criterios de aceptación:

### Feature: Visualización de la Informacion de una mascota

### Scenario: Visualización del detalle de una mascota

 - **Given** que la familia selecciona una mascota del listado
 - **When** accede a su detalle
 - **Then** el sistema muestra la información completa de la mascota

### Scenario: Visualización de fotografías

 - **Given** que la familia accede al detalle de una mascota
 - **When** existen imágenes asociadas
 - **Then** el sistema muestra las fotos de la mascota

### Scenario: Visualización del historial básico

 - **Given** que la familia accede al detalle de una mascota
 - **When** la mascota tiene información de salud registrada
 - **Then** el sistema muestra su historial básico

 ### Story Points HU-07
    -5 puntos
    Visualización de detalle con más información (datos, fotos e historial). Mayor alcance que el listado
---

# Épica 4: Solicitud y Matching

## HU-08 – Solicitar adopción

 - **Como** familia adoptante
 - **Quiero** enviar una solicitud de adopción
 - **Para** expresar interés en una mascota

## Criterios de aceptación

### Feature: Solicitud de adopción

### Scenario: Selección de mascota para solicitud
- **Given** que la familia adoptante está explorando mascotas disponibles
- **When** selecciona una mascota y confirma el envio de la solicitud
- **Then** el sistema permite iniciar una solicitud de adopción para esa mascota
- **and** el sistema confirma y registra la solicitud de adopción

### Scenario: Estado inicial de la solicitud
- **Given** que la familia adoptante ha enviado una solicitud de adopción
- **When** la solicitud es registrada en el sistema
- **Then** el estado de la solicitud queda como "pendiente"

### Scenario: Intento de solicitud sobre una mascota no disponible

- **Given** una mascota con estado no disponible para adopción
- **When** la familia adoptante intenta enviar una solicitud de adopción
- **Then** el sistema rechaza la solicitud
- **And** notifica que la mascota no está disponible para adopción

### Story Points HU-08
  - 3 puntos de estimacion
    Flujo CRUD sencillo: selección + registro + estado inicial+ validaciones simples.

   --- 

## HU -09 – Consultar detalle de solicitud de adopción

**Como** administrador  
**Quiero** visualizar la información de la familia y la mascota en una solicitud  
**Para** analizar la viabilidad de la adopción  

## Criterios de aceptacion

## Feature: Consulta de solicitud de adopción

### Scenario: Visualización de información completa  
**Given** que existe una solicitud de adopción  
**When** el administrador accede a su detalle  
**Then** el sistema muestra la información de la familia y de la mascota  



### Scenario: Intento de acceso a una solicitud inexistente  
**Given** que un administrador intenta acceder al detalle de una solicitud mediante un ID que no existe  
**When** el sistema procesa la peticion 
**Then** el sistema muestra un mensaje informativo: "La solicitud consultada no existe o ha sido eliminada permanentemente"  

### Story Points HU-09
  - 3 puntos de estimacion
    Flujo unicamente de visualizacion no incluye logica compleya mas que manejo de sesiones

---

## HU-10– Registrar decisión sobre solicitud

**Como** administrador  
**Quiero** aprobar o rechazar una solicitud de adopción  
**Para** controlar el proceso de asignación de mascotas  

## Criterios de aceptacion

## Feature: Gestión de decisión de solicitud  

### Scenario: Aprobación de solicitud  
**Given** que el administrador ha revisado la solicitud  
**When** decide aprobarla  
**Then** el sistema registra la solicitud como "aprobada"  

### Scenario: Rechazo de solicitud  
**Given** que el administrador ha revisado la solicitud  
**When** decide rechazarla  
**Then** el sistema registra la solicitud como "rechazada"  


### Story Points HU-10
  - 5 puntos de estimacion
    Logica de de cambio de estado de solicitud incluye ver datos de tablas con datos existentes

---

## HU-11 – Sugerir alternativa de adopción

**Como** administrador  
**Quiero** sugerir una mascota alternativa a una familia  
**Para** mejorar la probabilidad de éxito en la adopción  

## Criterios de aceptacion

## Feature: Sugerencia de mascota alternativa  

### Scenario: Registro de sugerencia  
**Given** que el administrador identifica una mejor opción  
**When** asigna una mascota sugerida a la familia  
**Then** el sistema registra la sugerencia de adopción  

### Scenario: Intento de sugerir una mascota no disponible
**Given** que el administrador selecciona una mascota que ya está en proceso de adopción
**When** registra la sugerencia para esa familia
**Then** el sistema invalida la operación y manda un mensaje informativo: "La mascota seleccionada no se encuentra disponible para adopción"

### Story Points HU-11
  - 3 puntos de estimacion
    Logica no incluye tablas adyacentes unicamente incluye un registro en una tabla como sugerencia


# Épica 5: Confirmación de Adopción

## HU-12 – Confirmar adopción

**Como** administrador  
**Quiero** confirmar una adopción  
**Para** registrar que la mascota ha encontrado una familia  

## Criterios de aceptación

### Feature: Confirmación de adopción

### Scenario: Cambio de estado a adopción exitosa
**Given** que existe una solicitud de adopción aprobada  
**When** el administrador confirma la adopción  
**Then** el estado de la solicitud cambia a "adopción exitosa"  

### Scenario: Registro de la fecha de adopción
**Given** que el administrador confirma una adopción  
**When** la adopción es registrada como exitosa  
**Then** el sistema registra la fecha de la adopción  

### Scenario: Vinculación de mascota con familia
**Given** que una adopción ha sido confirmada  
**When** el sistema registra la adopción como exitosa  
**Then** la mascota queda vinculada a la familia adoptante 

### Story Points HU-12
  - 3 puntos de estimacion
    Cambio de estado , manejo de fechas , relacion de dos tablas logica directa
---
    
## HU-13 – Visualizar adopciones realizadas

**Como** usuario (refugio o familia)  
**Quiero** ver el historial de adopciones  
**Para** hacer seguimiento de adopciones exitosas  

## Criterios de aceptación

### Feature: Visualización de adopciones realizadas

### Scenario: Acceso a la sección de adopciones realizadas
**Given** que el usuario accede al sistema  
**When** navega a la sección "Adopciones realizadas"  
**Then** el sistema muestra la sección de historial de adopciones  

### Scenario: Visualización de registros históricos
**Given** que el usuario se encuentra en la sección de adopciones realizadas  
**When** consulta el historial  
**Then** el sistema muestra los registros de adopciones exitosas  

### Scenario: Filtrado de adopciones por usuario
**Given** que el usuario visualiza el historial de adopciones  
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

### Feature: Generación de calendario de vacunación

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
    logica de negocio importante
    ---

## HU-15 – Consultar calendario

 - **Como** familia adoptante  
 - **Quiero** ver el calendario de vacunación  
 - **Para** cumplir con los cuidados de salud de la mascota  

## Criterios de aceptación

### Feature: visualizacion del calendario de vacunación

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