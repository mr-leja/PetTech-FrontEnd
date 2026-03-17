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
  Given que la familia registra una edad menor a la permitida (+18)
  When intenta completar el registro
  Then el sistema rechaza el registro
  And informa que debe ser mayor de edad

### Scenario: Consulta de información registrada
  Given que la familia ha completado su registro
  When accede a su perfil
  Then puede visualizar su información personal, condiciones del hogar y experiencia registrada