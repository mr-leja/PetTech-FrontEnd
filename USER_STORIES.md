# Épica 1: Gestion de Mascotas

## HU-01 - Registrar mascota

- Como refugio
- Quiero registrar una mascota incluyendo su información básica, estado de salud y su foto 
- Para centralizar toda la información necesaria para su publicación y futuro proceso de adopción

## Criterios de aceptacion

### Feature: Registro completo de mascotas

#### Scenario: Registro exitoso con perfil completo

- Given que el administrador del refugio completa los campos obligatorios
- And adjunta el historial de salud (vacunas y esterilización)
- And selecciona una fotografía válida
- When confirma el registro de la mascota
- Then el sistema debe almacenar el perfil completo
- And mostrar la mascota en la vista de adopción con su foto y su informacion

#### Scenario: Intento de registro sin datos obligatorios
- Given que el administrador deja vacíos campos obligatorios (como la edad o la especie)
- When intenta guardar la mascota
- Then el sistema debe mostrar un mensaje de error destacando los campos faltantes
- And no debe crear el registro en la base de datos

#### Scenario: Validación de formato de imagen incorrecto
- Given que el administrador intenta subir un archivo que no es una imagen (ej. un .pdf o .docx)
- When intenta procesar el registro
- Then el sistema debe notificar que el formato de archivo no es compatible

## Story Points HU-01


# Épica 2: Gestion de familias

## HU-02 - Registro de Familias

- Como familia adoptante
- Quiero crear mi perfil con información personal
- Para poder participar en el proceso de adopción

## Criterios de aceptacion

### Feature: Registro completo de familia adoptante

#### Scenario: Registro exitoso con información completa
  - Given que la familia proporciona su información personal, condiciones del hogar y experiencia con mascotas
  - When se registra en el sistema
  - Then la información queda almacenada correctamente
  - And la familia queda habilitada para participar en procesos de adopción

#### Scenario: Validación de datos obligatorios
  - Given que la familia omite datos personales obligatorios (numero de identificacion o edad)
  - When intenta registrarse
  - Then el sistema rechaza el registro
  - And informa que existen campos obligatorios faltantes

#### Scenario: Validación de mayoría de edad
  - Given que la familia registra una edad menor a la permitida (+18)
  - When intenta completar el registro
  - Then el sistema rechaza el registro
  - And informa que debe ser mayor de edad

### Scenario: Consulta de información registrada
  - Given que la familia ha completado su registro
  - When accede a su perfil
  - Then puede visualizar su información personal, condiciones del hogar y experiencia registrada

## Story Points HU-02


# Épica 3: Visualización de Mascotas

## HU-03 - Ver listado de mascotas

- Como familia adoptante
- Quiero visualizar el listado de mascotas y consultar el detalle de cada una
- Para explorar opciones y conocer sus características antes de solicitar una adopción

## Criterios de aceptacion

### Feature: Consulta de mascotas disponibles

#### Scenario: Visualización del listado de mascotas
  - Given que existen mascotas registradas en el sistema
  - When la familia accede a la sección de mascotas
  - Then se muestra el listado de mascotas disponibles
  - And cada mascota presenta su información básica

#### Scenario: Visualización del detalle de una mascota
  - Given que una mascota está disponible en el listado
  - When la familia consulta el detalle de la mascota
  - Then se muestra la información completa de la mascota
  - And se visualizan sus fotos

#### Scenario: Visualización según disponibilidad de la mascota
  - Given que existen mascotas registradas con diferentes estados de disponibilidad
  - When la familia accede al listado de mascotas
  - Then se muestran únicamente las mascotas disponibles
  - And las mascotas no disponibles no se presentan en el listado

  ## Story Points HU-03

---

# Épica 4: Solicitud y Matching

## HU-04 – Solicitar adopción

Como familia adoptante
 Quiero enviar una solicitud de adopción
 Para expresar interés en una mascota

## Criterios de aceptación:

- Se puede seleccionar una mascota
- Se envia la solicitud
- El estado queda como “pendiente”

## Gherkin

## Feature: Solicitud de adopción

#### Scenario: Selección de mascota para solicitud
- Given que la familia adoptante está explorando mascotas disponibles
- When selecciona una mascota y confirma el envio de la solicitud
- Then el sistema permite iniciar una solicitud de adopción para esa mascota
- and el sistema confirma y registra la solicitud de adopción

#### Scenario: Estado inicial de la solicitud
- Given que la familia adoptante ha enviado una solicitud de adopción
- When la solicitud es registrada en el sistema
- Then el estado de la solicitud queda como "pendiente"
## Story Points HU-04
  - 3 puntos de estimacion
    Flujo CRUD sencillo: selección + registro + estado inicial+ validaciones simples.

# HU-05 – Evaluar Compatibilidad

**Como** administrador  
**Quiero** revisar información de familia y mascota  
**Para** validar la compatibilidad antes de aprobar o sugerir la adopción  

---

## Criterios de aceptación

- Se puede visualizar información de ambas partes  
- Se puede tomar decisión de aprobación o rechazo  
- Se puede asignar una sugerencia de mascota a una familia  
- La asignación queda registrada  

---

## Feature: Evaluación de compatibilidad

### Scenario: Visualización de información de familia y mascota
**Given** que el administrador está revisando una solicitud de adopción  
**When** accede al detalle de la solicitud  
**Then** el sistema muestra la información de la familia y de la mascota  

---

### Scenario: Toma de decisión sobre la solicitud
**Given** que el administrador ha revisado la información de la familia y la mascota  
**When** decide aprobar o rechazar la solicitud  
**Then** el sistema permite registrar la asignación tomada  

---

### Scenario: Sugerencia de mascota a una familia
**Given** que el administrador identifica una mejor opción de adopción  
**When** asigna una mascota sugerida a una familia  
**Then** el sistema registra la sugerencia de adopción  

---

### Scenario: Registro de la decisión
**Given** que el administrador ha tomado una decisión sobre una solicitud  
**When** la decisión es confirmada  
**Then** la solicitud pasa a un estado de "aprobado" o "rechazado"

## Story Points HU-04
  - 5 puntos de estimacion
    Mayor complejidad , logica cruzada de diferentes tablas , logica de decision

# Épica 5: Confirmación de Adopción

## HU-06 – Confirmar adopción

**Como** administrador  
**Quiero** confirmar una adopción  
**Para** registrar que la mascota ha encontrado una familia  

---

## Criterios de aceptación

- Se puede cambiar el estado a “adopción exitosa”  
- Se registra la fecha de adopción  
- Se vincula la mascota con la familia  

---

## Feature: Confirmación de adopción

### Scenario: Cambio de estado a adopción exitosa
**Given** que existe una solicitud de adopción aprobada  
**When** el administrador confirma la adopción  
**Then** el estado de la solicitud cambia a "adopción exitosa"  

---

### Scenario: Registro de la fecha de adopción
**Given** que el administrador confirma una adopción  
**When** la adopción es registrada como exitosa  
**Then** el sistema registra la fecha de la adopción  

---

### Scenario: Vinculación de mascota con familia
**Given** que una adopción ha sido confirmada  
**When** el sistema registra la adopción como exitosa  
**Then** la mascota queda vinculada a la familia adoptante  

## Story Points HU-06
  - 3 puntos de estimacion
    Cambio de estado , manejo de fechas , relacion de dos tablas logica directa

    
# HU-07 – Visualizar adopciones realizadas

**Como** usuario (refugio o familia)  
**Quiero** ver el historial de adopciones  
**Para** hacer seguimiento de adopciones exitosas  

---

## Criterios de aceptación

- Existe la sección “Adopciones realizadas”  
- Se muestran registros históricos  
- Se puede filtrar por usuario  

---

## Feature: Visualización de adopciones realizadas

### Scenario: Acceso a la sección de adopciones realizadas
**Given** que el usuario accede al sistema  
**When** navega a la sección "Adopciones realizadas"  
**Then** el sistema muestra la sección de historial de adopciones  

---

### Scenario: Visualización de registros históricos
**Given** que el usuario se encuentra en la sección de adopciones realizadas  
**When** consulta el historial  
**Then** el sistema muestra los registros de adopciones exitosas  

---

### Scenario: Filtrado de adopciones por usuario
**Given** que el usuario visualiza el historial de adopciones  
**When** aplica un filtro por usuario  
**Then** el sistema muestra únicamente las adopciones asociadas a ese usuario  

## Story Points HU-07
  - 5 puntos de estimacion
    logica de filtro complejo + paginacion


# Épica 6: Calendario de Vacunación

## HU-08 – Generar calendario de vacunas

**Como** sistema  
**Quiero** generar un calendario inicial de vacunación  
**Para** orientar al adoptante en el cuidado de la mascota  

---

## Criterios de aceptación

- Se consideran especie, edad e historial  
- Se generan fechas sugeridas  
- El calendario queda asociado a la adopción  

---

## Feature: Generación de calendario de vacunación

### Scenario: Generación del calendario considerando características de la mascota
**Given** que una adopción ha sido confirmada  
**When** el sistema genera el calendario de vacunación  
**Then** el sistema considera la especie, edad e historial de la mascota  

---

### Scenario: Generación de fechas sugeridas de vacunación
**Given** que el sistema está generando el calendario de vacunación  
**When** se calculan las vacunas correspondientes  
**Then** el sistema establece fechas sugeridas para cada vacuna  

---

### Scenario: Asociación del calendario a la adopción
**Given** que el calendario de vacunación ha sido generado  
**When** el sistema finaliza el proceso  
**Then** el calendario queda asociado a la adopción  

## Story Points HU-08
  - 8 puntos de estimacion
    logica de negocio importante

## HU-09 – Consultar calendario

Como familia adoptante  
Quiero ver el calendario de vacunación  
Para cumplir con los cuidados de salud de la mascota  

## Criterios de aceptación

El calendario es visible después de la adopción  

Se muestran vacunas y fechas  

La información es clara y ordenada  

## Feature: visualizacion del calendario de vacunación
### Scenario: Asociación del calendario a la adopción
**Given** que la familia adoptante ha completado una adopción  
**When** accede a la información de su mascota  
**Then** el sistema muestra el calendario de vacunación con sus fechas correspondientes  
## Story Points HU-09
  - 3 puntos de estimacion
    Unicamente flujo de lectura no hay logica por detras