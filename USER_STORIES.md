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