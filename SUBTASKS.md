# Tasking (Subtareas) - PetTech MVP

## HU-01 - Registrar información básica de la mascota (5 SP)

### Tareas de DEV
- DEV-01-1: Diseñar y crear tabla mascotas en la base de datos con los campos: nombre, especie, raza, edad, fecha_nacimiento, tamaño, peso, sexo, nivel_energia, historia, estado (disponible por defecto)
-  DEV-01-2: Crear entidad/modelo Mascota con sus atributos y restricciones de validación a nivel de modelo
-  DEV-01-3: Crear DTO de entrada RegistrarMascotaDTO con validaciones de campos obligatorios (nombre, especie, edad, sexo, nivel de energía)
-  DEV-01-4: Exponer endpoint POST /mascotas que reciba el DTO, valide y persista el registro
-  DEV-01-5: Implementar validación de especie contra un listado de valores permitidos (perro, gato, conejo, etc.) retornando error descriptivo ante valor no reconocido

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

 ### Tareas de QA
- QA-02-1: Diseñar matriz de datos de prueba: salud completa, campo estado_vacunacion vacío, mascota marcada como esterilizada, ID de mascota inexistente
-  QA-02-2: Automatizar escenario: registro exitoso de información de salud — datos asociados correctamente a la mascota
-  QA-02-3: Automatizar escenario: intento sin campo estado_vacunacion — verificar que el sistema rechaza y no persiste
-  QA-02-4: Automatizar escenario: mascota marcada como esterilizada queda con ese dato disponible en su perfil

---

## HU-03 - Subir fotos de la mascota    

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

## HU-04 - Registrar información básica de familia 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-05 - Registrar condiciones del hogar y experiencia 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-06 - Ver listado de mascotas 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-07 – Ver detalle de mascota 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-08 – Solicitar adopción 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-09 – Evaluar Compatibilidad 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-10 – Confirmar adopción 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-11 – Visualizar adopciones realizadas 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-12 – Generar calendario de vacunas 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---

## HU-13 – Consultar calendario 

### Tareas de DEV
- [ ] DEV-n: [Escribe aquí tu subtarea técnica]

### Tareas de QA
- [ ] QA-n: [Escribe aquí qué probar o automatizar]

---
