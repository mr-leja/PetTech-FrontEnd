# Tasking (Subtareas) - PetTech MVP

## HU-01 - Registrar información básica de la mascota (5 SP)

### Tareas de DEV
- DEV-01-1: Diseñar y crear tabla mascotas en la base de datos con los campos: nombre, especie, raza, edad, fecha_nacimiento, tamaño, peso, sexo, nivel_energia, historia, estado (disponible por defecto)
-  DEV-01-2: Crear entidad/modelo Mascota con sus atributos y restricciones de validación a nivel de modelo
-  DEV-01-3: Crear DTO de entrada RegistrarMascotaDTO con validaciones de campos obligatorios (nombre, especie, edad, sexo, nivel de energía)
-  DEV-01-4: Exponer endpoint POST /mascotas que reciba el DTO, valide y persista el registro
-  DEV-01-5: Implementar validación de especie contra un listado de valores permitidos (perro, gato, conejo, etc.) retornando error descriptivo ante valor no reconocido

### Tareas de FRONT

- FRONT-01-1: Crear formulario de registro de mascota con campos: nombre, especie (select), raza, edad, fecha de nacimiento, tamaño, peso, sexo (select), nivel de energía (select), historia
- FRONT-01-2: Implementar validaciones en cliente (campos obligatorios, formatos, valores mínimos) antes del envío
- FRONT-01-3: Integrar formulario con endpoint POST /mascotas mediante servicio HTTP
- FRONT-01-4: Manejar estados de UI: loading, éxito (mensaje de confirmación) y error (mostrar mensaje del backend)
- FRONT-01-5: Implementar control de lista desplegable para especie basado en valores permitidos (evitar input libre)

### Tareas de QA
- QA-01-1: Diseñar matriz de datos de prueba contemplando: registro completo válido, campos obligatorios vacíos (por separado), especie fuera del listado permitido y valores en límites de longitud
-  QA-01-2: Automatizar escenario: registro exitoso — todos los campos obligatorios completos y respuesta con estado "disponible"
-  QA-01-3: Automatizar escenario: campos obligatorios vacíos — verificar que el sistema retorna error descriptivo y no crea el registro
-  QA-01-4: Automatizar escenario: especie no reconocida — verificar mensaje de error descriptivo
-  QA-01-5: Ejecutar prueba exploratoria sobre el endpoint de registro buscando comportamientos inesperados con datos de borde (cadenas vacías, caracteres especiales, valores negativos en edad)

---

## HU-02 – Registrar información de salud (3 SP)

 ### Tareas de DEV
- DEV-02-1: Crear tabla salud_mascota con los campos: id_mascota (FK), estado_vacunacion, esterilizada (booleano), desparasitada (booleano), observaciones
-  DEV-02-2: Crear DTO de entrada RegistrarSaludDTO con validación del campo estado_vacunacion como obligatorio
-  DEV-02-3: Exponer endpoint POST /mascotas/{id}/salud que reciba el DTO y asocie los datos de salud a la mascota identificada
-  DEV-02-4: Implementar respuesta de error cuando se intenta registrar salud para una mascota que no existe en el sistema

### Tareas de FRONT

- FRONT-02-1: Crear formulario de salud asociado a mascota (estado de vacunación, esterilización, desparasitación, observaciones)
- FRONT-02-2: Validar campo obligatorio estado de vacunación antes del envío
- FRONT-02-3: Integrar con endpoint POST /mascotas/{id}/salud
- FRONT-02-4: Mostrar feedback visual de éxito/error al registrar información de salud
- FRONT-02-5: Bloquear acceso al formulario si no existe ID de mascota válido

 ### Tareas de QA
- QA-02-1: Diseñar matriz de datos de prueba: salud completa, campo estado_vacunacion vacío, mascota marcada como esterilizada, ID de mascota inexistente
-  QA-02-2: Automatizar escenario: registro exitoso de información de salud — datos asociados correctamente a la mascota
-  QA-02-3: Automatizar escenario: intento sin campo estado_vacunacion — verificar que el sistema rechaza y no persiste
-  QA-02-4: Automatizar escenario: mascota marcada como esterilizada queda con ese dato disponible en su perfil

---

## HU-03 - Subir fotos de la mascota (3 SP)

### Tareas de DEV
- DEV-03-1: Configurar integración con proveedor de almacenamiento externo (Amazon S3 o equivalente) para la carga de archivos multimedia
- DEV-03-2: Exponer endpoint POST /mascotas/{id}/fotos que reciba el archivo, lo valide y lo suba al proveedor externo
- DEV-03-3: Implementar validación de formato de archivo (solo JPG y PNG permitidos) y tamaño máximo (5 MB)
- DEV-03-4: Almacenar únicamente la URL de referencia del archivo en la tabla mascotas (nunca el archivo en el servidor de aplicaciones)

 ### Tareas de QA
- QA-03-1: Diseñar matriz de datos de prueba: imagen JPG válida (<5 MB), imagen PNG válida (<5 MB), archivo .pdf, archivo .docx, imagen JPG >5 MB, solicitud sin archivo adjunto
-  QA-03-2: Automatizar escenario: carga de imagen JPG y PNG válidas — verificar que se almacena la URL y el archivo es accesible
-  QA-03-3: Automatizar escenario: intento de carga con formato no permitido (.pdf, .docx) — verificar mensaje de error y no almacenamiento
-  QA-03-4: Automatizar escenario: intento de carga de imagen superior a 5 MB — verificar que el sistema rechaza con mensaje de tamaño máximo

---

## HU-04 - Registrar información básica de familia (5 SP)

### Tareas de DEV
-DEV-04-1: Diseñar y crear tabla familias_adoptantes con los campos: nombre_completo, cedula, edad, direccion, telefono, correo, redes_sociales (opcional)
- DEV-04-2: Crear entidad/modelo FamiliaAdoptante con restricciones de unicidad en cédula y correo
- DEV-04-3: Crear DTO de entrada RegistrarFamiliaDTO con validaciones: campos obligatorios presentes, edad >= 18, formato de correo válido
- DEV-04-4: Exponer endpoint POST /familias que reciba el DTO, valide y persista el registro
- DEV-04-5: Implementar regla de negocio que rechaza el registro cuando la edad ingresada es menor a 18 años, retornando un mensaje descriptivo

### Tareas de QA
-QA-04-1: Diseñar matriz de datos de prueba: registro válido completo, campos obligatorios vacíos (cédula, nombre, dirección), edad = 17, edad = 18, cédula duplicada, correo con formato inválido
- QA-04-2: Automatizar escenario: registro exitoso con todos los datos personales válidos — perfil creado con estado activo
- QA-04-3: Automatizar escenario: campos obligatorios vacíos — sistema rechaza y señala los campos faltantes
- QA-04-4: Automatizar escenario: edad = 17 — sistema rechaza registro con mensaje de mayoría de edad requerida
- QA-04-5: Ejecutar prueba exploratoria sobre el endpoint verificando respuesta ante cédula ya existente y correo duplicado

---

## HU-05 - Registrar condiciones del hogar y experiencia (3 SP)

### Tareas de DEV
-DEV-05-1: Crear tabla condiciones_hogar con los campos: id_familia (FK), tipo_vivienda, tamaño_hogar, presencia_ninos, horas_sola_mascota, ingresos_estimados, experiencia_previa, motivacion
- DEV-05-2: Crear DTO de entrada CondicionesHogarDTO con validaciones de campos obligatorios (tipo_vivienda, tamaño_hogar, horas_sola_mascota, ingresos_estimados)
- DEV-05-3: Exponer endpoint PUT /familias/{id}/hogar para registrar o actualizar las condiciones del hogar de la familia
- DEV-05-4: Implementar sub-estructura opcional para mascotas existentes en el hogar (especie, edad, estado de vacunación)

### Tareas de QA
-QA-05-1: Diseñar matriz de datos de prueba: hogar completo sin mascotas previas, hogar con mascotas existentes registradas, campos obligatorios del hogar vacíos, ID de familia inexistente
- QA-05-2: Automatizar escenario: registro exitoso de condiciones del hogar — datos asociados al perfil de la familia
- QA-05-3: Automatizar escenario: campos obligatorios del hogar vacíos — sistema rechaza y notifica campos faltantes
- QA-05-4: Automatizar escenario: registro con información de mascotas existentes — datos guardados en la sub-estructura

---

## HU-06 - Ver listado de mascotas (3 SP)

### Tareas de DEV
-DEV-06-1: Exponer endpoint GET /mascotas que retorne únicamente las mascotas con estado disponible
- DEV-06-2: Configurar DTO de respuesta del listado con los campos: nombre, especie, raza, edad, foto_url (primera foto asociada)
- DEV-06-3: Implementar filtro de estado disponible en la consulta a la base de datos (no traer mascotas en proceso o adoptadas)
- DEV-06-4: Implementar respuesta vacía con mensaje descriptivo cuando no existe ninguna mascota disponible
### Tareas de QA
-QA-06-1: Diseñar matriz de datos de prueba: sistema con mascotas disponibles, sistema con mascotas en proceso y adoptadas, sistema sin ninguna mascota registrada
- QA-06-2: Automatizar escenario: respuesta incluye solo mascotas con estado "disponible" — verificar que las de otros estados no aparecen
- QA-06-3: Automatizar escenario: mascotas con estado "en proceso" o "adoptada" no están presentes en el listado
- QA-06-4: Automatizar escenario: cuando no hay mascotas disponibles el endpoint retorna la respuesta vacía con el mensaje correspondiente

---

## HU-07 – Ver detalle de mascota (5 SP)

### Tareas de DEV
-DEV-07-1: Exponer endpoint GET /mascotas/{id} que retorne la información completa de la mascota identificada
- DEV-07-2: Configurar DTO de respuesta con todos los campos: información general, lista de URLs de fotografías e historial de salud
- DEV-07-3: Realizar JOIN entre la tabla mascotas, salud_mascota y los registros de fotos para consolidar la respuesta en un solo objeto
- DEV-07-4: Implementar comportamiento cuando la mascota no tiene fotografías cargadas: retornar URL de imagen de reemplazo predeterminada
- DEV-07-5: Implementar respuesta 404 con mensaje descriptivo cuando el ID de mascota solicitado no existe en el sistema

### Tareas de QA
-QA-07-1: Diseñar matriz de datos de prueba: mascota con todos los datos, mascota sin fotos, mascota sin historial de salud, ID de mascota inexistente
- QA-07-2: Automatizar escenario: detalle completo — respuesta contiene información general, fotos e historial de salud correctamente consolidados
- QA-07-3: Automatizar escenario: mascota con fotografías registradas — lista de URLs presente en la respuesta y accesibles
- QA-07-4: Automatizar escenario: mascota sin fotografías — campo de foto retorna la URL de imagen de reemplazo predeterminada
- QA-07-5: Automatizar escenario: ID inexistente — sistema retorna respuesta 404 con mensaje descriptivo

---

## HU-08 – Solicitar adopción (3 SP)

### Tareas de DEV
-DEV-08-1: Diseñar y crear tabla solicitudes_adopcion con los campos: id_familia (FK), id_mascota (FK), estado (pendiente por defecto), fecha_solicitud
- DEV-08-2: Exponer endpoint POST /solicitudes que valide las precondiciones y cree el registro de solicitud con estado "pendiente"
- DEV-08-3: Implementar validación de precondiciones: la familia debe tener condiciones del hogar registradas y la mascota debe estar en estado "disponible"
- DEV-08-4: Actualizar el estado de la mascota de "disponible" a "en proceso de adopción" de forma atómica al crear la solicitud exitosamente

### Tareas de QA
-QA-08-1: Diseñar matriz de datos de prueba: familia con perfil completo + mascota disponible, familia sin condiciones del hogar, mascota en estado "en proceso", ID de mascota inexistente
- QA-08-2: Automatizar escenario: solicitud exitosa — registro creado con estado "pendiente" y mascota cambia a "en proceso de adopción"
- QA-08-3: Automatizar escenario: familia sin condiciones del hogar — sistema bloquea la solicitud con mensaje descriptivo
- QA-08-4: Automatizar escenario: mascota ya en proceso — sistema rechaza la segunda solicitud e informa que no está disponible

---

## HU-09 – Consultar detalle de solicitud de adopción (3 SP)

### Tareas de DEV
- DEV-09-1: Exponer endpoint GET /solicitudes/{id} que retorne la información consolidada de la solicitud en formato json
- DEV-09-2: Realizar JOIN entre la tabla solicitudes_adopcion, familias_adoptantes y mascotas para armar la respuesta en un objeto aplanado
- DEV-09-3: Implementar respuesta 404 con mensaje el cual pueda ser de facil entendimiento desde el frontend
- DEV-09-4: Implementar la vista para que solo el adminsitrador pueda ver las solicitudes correspondientes
### Tareas de QA
- QA-09-1: Diseñar matriz de datos: solicitud existente con informacion completa de la  familia y mascota, entre otros datos relevantes
- QA-09-2: Automatizar escenario: consulta exitosa — respuesta contiene información de la familia y de la mascota correctamente aplanada
- QA-09-3: Automatizar escenario: ID inexistente — sistema retorna 404 con mensaje de facil entendimiento

---
## HU-10 – Registrar decisión sobre solicitud (5 SP)

### Tareas de DEV
- DEV-10-1: Realizar el endpoint PUT /solicitudes/{id}/decision que reciba la decisión (aprobada o rechazada) y actualice el estado en la tabla correspondiente
- DEV-10-2: Cuando la decisión es "aprobada", actualizar únicamente el estado de la tabla solicitudes_adopcion a "aprobada". La mascota ya se encuentra en estado "en proceso de adopción" desde que la solicitud fue creada en HU-08, por lo tanto no se modifica su estado en este punto
- DEV-10-3: Cuando la decisión es "rechazada", actualizar el estado de la tabla solicitudes_adopcion a "rechazada" y devolver el estado de la mascota de "en proceso de adopción" a "disponible", para que pueda recibir nuevas solicitudes de otras familias
- DEV-10-4: Retornar error 409 (Conflict) cuando se intenta cambiar la decisión de una solicitud que ya tiene estado "aprobada" o "rechazada", retornando un mensaje descriptivo: "La decisión sobre esta solicitud ya fue registrada y no puede modificarse"
### Tareas de QA
- QA-10-1: Diseñar matriz de datos: solicitud pendiente aprobada, solicitud pendiente rechazada, solicitud ya aprobada que intenta cambiar de estado, ID de solicitud inexistente
- QA-10-2: Automatizar con serenity el escenario: aprobación de solicitud pendiente — estado cambia a "aprobada" y mascota pasa a "en proceso"
- QA-10-3: Automatizar con serenity el escenario: rechazo de solicitud pendiente — estado cambia a "rechazada" y mascota vuelve a "disponible"
- QA-10-4: Ejecutar una prueba exploratoria manual verificando que los estados de solicitud y mascota sigan el flujo correcto

---

## HU-11 – Sugerir alternativa de adopción (3 SP)

### Tareas de DEV
- DEV-11-1: Crear tabla sugerencias_adopcion con los campos: id_solicitud (FK), id_mascota_sugerida (FK), fecha_sugerencia, motivo
- DEV-11-2: Crear endpoint  de tipo POST /solicitudes/{id}/sugerencia que registre la mascota alternativa
- DEV-11-3: Validar que la mascota sugerida exista en el sistema y esté en estado "disponible" antes de registrar la sugerencia caso contrario mandar un error que sea entendido por el administrador

### Tareas de QA
- QA-11-1: Diseñar matriz de datos: solicitud existente con mascota disponible sugerida, mascota sugerida en estado "en proceso", ID de mascota sugerida que no existe, ID de solicitud inexistente
- QA-11-2: Automatizar escenario: sugerencia exitosa — registro creado con los datos correctos de la solicitud y la mascota sugerida por el administrador
- QA-11-3: Automatizar escenario: mascota sugerida no disponible — sistema rechaza el registro e informa el motivo con un mensaje que entienda el administrador

---

## HU-12 – Confirmar adopción (3 SP)

### Tareas de DEV
- DEV-12-1: Crear tabla adopciones con los campos: id_solicitud (FK), id_familia (FK), id_mascota (FK), fecha_adopcion, estado
- DEV-12-2: Crear endpoint de tipo POST /adopciones que tome una solicitud en estado "aprobada"
- DEV-12-3: Actualizar el estado de la solicitud a "adopción exitosa" y el estado de la mascota a "adoptada"
- DEV-12-4: Retornar error si se intenta confirmar una adopción para una solicitud que no esté en estado "aprobada"

### Tareas de QA
- QA-12-1: Diseñar matriz de datos: solicitud aprobada lista para confirmar, solicitud en estado "pendiente"
- QA-12-2: Automatizar escenario: confirmación exitosa — registro en tabla adopciones con fecha, mascota pasa a "adoptada" y solicitud a "adopción exitosa"
- QA-12-3: Automatizar escenario: intento de confirmar solicitud pendiente — sistema rechaza la operación con mensaje que entienda el administrador

---

## HU-13 – Visualizar adopciones realizadas (5 SP)

### Tareas de DEV
- DEV-13-1: Crear endpoint  de tipo GET /adopciones que nos devuelva el listado de adopciones con estado "adopción exitosa"
- DEV-13-2: Configurar DTO de respuesta con los datos necesarios: nombre de la mascota, especie, fecha de adopción y nombre de la familia
- DEV-13-3: Implementar paginación en el endpoint para que el sistema solo traiga los 10 primeros de cada pagina esto debido a que es mejor traer parte por parte que todo el resultado
- DEV-13-4: Si la respuesta  es  vacía se debe retornar con mensaje informativo cuando el usuario no tiene adopciones en proceso

### Tareas de QA
- QA-13-1: Diseñar matriz de datos: usuario con múltiples adopciones, usuario sin ninguna adopción, filtro aplicado a un usuario específico, listado general sin filtro
- QA-13-2: Automatizar escenario: listado general — solo aparecen adopciones con estado "adopción exitosa"
- QA-13-4: Automatizar escenario: usuario sin adopciones — sistema retorna respuesta vacía con mensaje informativo
- QA-13-5: Verificar que la paginación funciona mediante una prueba exploratoria para que se muestre  el historial con 10 registros por limite

---

## HU-14 – Generar calendario de vacunas (8 SP)

### Tareas de DEV
- DEV-14-1: Crear tabla calendario_vacunacion con los campos: id_adopcion (FK), vacuna, fecha_sugerida, especie, estado
- DEV-14-2: Implementar la lógica de negocio que define el protocolo de vacunación por especie: perros (Parvovirus, Moquillo, Rabia) y gatos (Panleucopenia, Calicivirus, Rabia)
- DEV-14-3: Implementar la distinción por etapa de vida: cachorro (vacunas con refuerzos cada 3-4 semanas) vs adulto (refuerzos anuales o trianuales)
- DEV-14-4: Considerar el historial de vacunación registrado en salud_mascota para no re-agendar vacunas ya aplicadas
- DEV-14-5: Disparar la generación del calendario automáticamente al confirmar una adopción 

### Tareas de QA
- QA-14-1: Diseñar matriz de datos: perro cachorro sin ninguna vacuna, perro adulto con vacunas parciales, gato sin historial, mascota con historial completo de vacunas, especie no reconocida por el sistema
- QA-14-2: Automatizar escenario: perro cachorro sin vacunas — calendario incluye protocolo completo con fechas de refuerzo correctas
- QA-14-3: Automatizar escenario: mascota con vacunas ya aplicadas — el sistema no duplica las vacunas existentes en el calendario
- QA-14-4: Automatizar escenario: gato sin historial — calendario incluye el protocolo felino correspondiente
- QA-14-5: Verificar que el calendario queda correctamente asociado al id_adopcion y no a otro registro

---

## HU-15 – Consultar calendario de vacunación (3 SP)

### Tareas de DEV
- DEV-15-1: Crear el  endpoint de tipo GET /adopciones/{id}/calendario que retorne el calendario asociado a una adopción  
- DEV-15-2: Validar que la adopción referenciada exista y tenga estado "adopción exitosa" antes de retornar el calendario
- DEV-15-3: Retornar mensaje renderizado en el frontend falta procesos por aprobar cuando la adopción está en estado "pendiente" o "aprobada" 
- DEV-15-4: Retornar 404 con mensaje renderizado en el frontend cuando el usuario adoptante no tiene ninguna adopción registrada en el sistema

### Tareas de QA
- QA-15-1: Diseñar matriz de datos: adopción confirmada con calendario generado, adopción en estado pendiente, usuario sin adopciones, ID de adopción inexistente
- QA-15-2: Automatizar escenario: consulta exitosa — sistema retorna el calendario con las fechas sugeridas de vacunación
- QA-15-3: Automatizar escenario: adopción en estado pendiente — sistema no muestra el calendario con mensaje informativo
- QA-15-4: Automatizar escenario: usuario sin adopción registrada — sistema deniega el acceso con mensaje que se entienda

---