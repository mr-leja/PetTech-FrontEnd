# PRD — PetTech: Matcher de Adopción y Cuidados

## Visión y Objetivos

PetTech es una plataforma que facilita la adopcion responsable de mascotas, ayudando a emparejar mascotas disponibles con familias adecuadas segun sus caracteristicas y condiciones de vida. 

---

## 1. Problema a resolver

Actualmente muchas adopciones fracasan porque:
- las familias no conocen las condiciones reales de la mascota
- los refugios de mascotas no tienen las herramientas necesarias para evaluar la compatibilidad con las familias que desean adoptar
- El proceso de seguimiento es manual, lo que hace que la adopción sea lenta
- los procesos de adopción se toman con información incompleta o sin considerar factores de compatibilidad
- Las familias no cuentan con herramientas que validen si su entorno (espacio, presupuesto, composición familiar) es compatible con la mascota que desean adoptar
- Muchas familias adoptan mascotas basándose solamente en factores emocionales como la apariencia, la raza o el tamaño
- Al realizar la adopción muchas familias no cuentan con una guía clara sobre el esquema inicial de vacunación de la mascota, lo que dificulta realizar un seguimiento adecuado de las primeras vacunas poniendo en peligro la salud de las mascotas

Estas situaciones muestran que todavia faltan herramientas que ayuden a evaluar de manera adecuada si una mascota realmente es compatible con la familia que desea adoptarla. Como resultado, se presentan adopciones fallidas por ejemplo, se estima que alrededor del 20.7 % de los animales adoptados son devueltos a los refugios. Esta realidad evidencia la importancia de contar con soluciones que orienten mejor a las familias durante el proceso de adopción, permitiendo tomar decisiones más informadas y responsables, reduciendo el riesgo de devoluciones y garantizando un mayor bienestar para los animales que esperan encontrar un hogar definitivo.


### solución
Para abordar los problemas identificados en el proceso de adopción, se propone el desarrollo de un sistema web llamado “PetTech: Matcher de Adopción y Cuidados”.

Este sistema contará con un sistema de emparejamiento manual que facilitará la adopción responsable entre mascotas disponibles y familias adoptantes. La solución permitirá analizar la información esencial tanto de las mascotas como de los posibles adoptantes, considerando factores como el tamaño del hogar, la presencia de niños y el ingreso familiar.

Con base en estos datos, el sistema generará sugerencias de las mascotas que sean más compatibles con la información de cada familia. Adicionalmente, una vez que la adopción sea exitosa, la plataforma generará automáticamente un calendario inicial de vacunación

### Usuarios Objetivo

| Usuario | Descripción |
|---|---|
| **Familia adoptante** | Hogares interesados en adoptar, con o sin experiencia previa |
| **Refugio o Centros de Adopción** | Organizaciones que administran mascotas disponibles para adopción |


## Objetivos del producto

### Objetivo General

Facilitar las adopciones responsables a traves de un sistema de emparejamiento entre las mascotas y las familias adoptantes

### Objetivos Especificos

- Reducir los procesos manuales en el proceso de adopción en refugios, mediante un registro digital tanto de las mascotas como de los adoptantes
- Mejorar la compatibilidad entre los hogares y las mascotas, considerando datos como el tamaño del hogar, la presencia de niños y los ingresos familiares
- Disminuir el numero de adopciones fallidas y devoluciones de las mascotas mediante recomendaciones de adopción más informadas
- Generar un calendario inicial de vacunación que guie a los adoptantes sobre los cuidados de salud necesarios para las mascotas

## Alcance del MVP

### Funcionalidades Incluidas (IN)

#### Registro de mascotas 

Los administradores podran registar mascotas con información basica de la mascota, como:

- Nombre
- Especie (perro, gato, conejo, etc)
- Raza (O indicar si es mestizo/criollo)
- Edad
- Fecha de Nacimiento
- Tamaño
- peso
- Sexo
- Nivel de energia
- Fotos/Videos
- Historial de vacunas
- Historia de la mascota (breve descripcion de su personalidad)
- Información adicional necesaria para el seguimiento del veterinario (desparasitacion, esterilizacion, etc)

## Roles y Permisos

### Admin
- Crear/editar mascotas
- Aprobar/rechazar solicitudes
- Validar emparejamientos
- Gestionar adopciones

### Familia Adoptante
- Ver mascotas
- Aplicar a adopción
- Ver historial

### Registro de las familias adoptantes

Las familias podran registrar información basica, como:

- Nombre Completo
- Cedula
- Edad (debe ser mayor de edad)
- Direccion de residencia
- Telefono
- Correo electronico
- Redes sociales (opcional)
- Tipo de vivienda (casa, apartamento, finca)
- Propiedad (casa propia o alquilada?)
- Cuantas personas viven en la casa
- otras mascotas (si tiene mas mascotas, pregunta: cantidad, especie, edad y si estan vacunadas/esterilizadas)
- Tiempo solo ¿Cuántas horas al día pasara la mascota sin compañía?
- Tamano del hogar
- Presencia de ninos
- Ingresos estimados para los cuidados de la mascota
- experiencia previa con mascotas
- Motivación ¿Por qué quiere adoptar una mascota en este momento?


### Sistema basico de matching

El administrador del sistema revisará la información proporcionada por la familia adoptante y el estilo de vida, basado en estos datos, analizara la personalidad de las mascotas registradas en el sistema y le sugerira/asignara mascotas compatibles.

Adicionalmente, las familias adoptantes podrán acceder a un panel de “Mascotas” donde podrán explorar las mascotas disponibles para adopción, consultar información relevante sobre cada una (como la edad,el tamaño y las características de comportamiento) y realizar una solicitud de interés de adopción para esa mascota específica.

El matching considerará criterios como:

- tamaño de la mascota vs tamaño del hogar
- Tiempo de soledad vs independencia de la mascota
- experiencia previa vs complejidad de la mascota
- Presencia de otras mascotas vs sociabilidad
- compatibilidad con niños
- costos estimados de cuidado vs gastos de la mascota

## Reglas de Matching

### incompatibilidad

- Si tamaño mascota > capacidad del hogar → incompatibilidad alta
- Si tiempo solo > 6h y mascota requiere alta compañía → incompatibilidad
- Si hay niños y mascota no es apta → bloqueo de sugerencia
- Si experiencia del adoptante < nivel requerido por la mascota → incompatibilidad alta
- Si existen otras mascotas en el hogar y la nueva mascota tiene baja sociabilidad → incompatibilidad
- Si los gastos estimados de la mascota > ingresos familiares declarados → incompatibilidad alta

### compatibilidad

- Si tamaño de la mascota ≤ capacidad del hogar → compatibilidad alta
- Si el tiempo de soledad ≤ nivel de independencia de la mascota → compatibilidad
- Si experiencia del adoptante ≥ nivel de experiencia requerido por la mascota → compatibilidad alta
- Si existen otras mascotas y la nueva mascota tiene alta sociabilidad → compatibilidad
- Si hay niños y la mascota es apta para convivencia con niños → compatibilidad alta
- Si los ingresos economicos ≥ gastos estimados de la mascota → compatibilidad

### Confirmacion de adopción

Cuando una familia elige una mascota y el refugio confirme que la adopción puede realizarse el sistema registrará el match como adopción exitosa. De esta manera, se reconoce que tanto la familia como el refugio han llegado a un acuerdo y que la mascota ha encontrado un nuevo hogar. Esto permitirá llevar un seguimiento más claro del proceso de adopción y de los casos que se concretan con éxito.

Además, las adopciones confirmadas podran visualizarse en una seccion denominada “Adopciones realizadas”, donde se almacenará el historial de adopciones completadas filtrado por usuarios.


### Generacion del Calendario de vacunas

Una vez confirmada la adopción, el sistema generará automáticamente un calendario inicial de vacunación personalizado para la mascota. Este calendario se calculará considerando factores como: 

- Especie (los protocolos para perros ( Parvovirus, Moquillo) son muy diferentes a los de gatos ( Panleucopenia, Calicivirus))
- Edad Biológica (El sistema debe distinguir entre cachorro (requiere refuerzos frecuentes) o adulto (refuerzos anuales o trienales))
- Historial de Vacunación (el sistema debe conocer qué vacunas ya tiene la mascota al momento de la adopción)

Esto, con el propósito de brindar apoyo a los adoptantes sobre los cuidados preventivos que deben realizarse en las etapas siguientes a la adopción. 

### Funcionalidades fuera del MVP (OUT)

las siguientes funcionalidades quedan fuera del alcance Inicial del proyecto: 

- Pasarela de Pagos
- seguimiento veterinario
- historial médico completo de la mascota
- chat entre adoptante y refugio
- Funcionalidades de Red social o comunidad (sistema de me gusta, comentarios, compartir, chat interno entre usarios)
- Envío automático de correos, sistemas de notificaciones o integraciones con servicios como WhatsApp Business API.
- Matching Avanzado con Inteligencia Artificial
- Integración con otros Sistemas Veterinarios
- Construccion para aplicativo movil


## 3. Riesgos

### 3.1 Riesgos de Negocio (RN) y Riesgos Técnicos (RT)

## Matriz de Riesgos

| ID  | Tipo    | Riesgo | Descripción | Mitigación | Probabilidad | Impacto |
|-----|---------|--------|-------------|------------|--------------|----------|
| RN1 | Negocio | Veracidad de la información declarada por el adoptante/familia adoptante | Existe un riesgo alto de que las familias que deseen adoptar proporcionen datos falsos en el formulario de registro con el objetivo de forzar un emparejamiento forzado con una mascota que les guste a primera vista, básicamente por ser bonito/a, pero que no es apta para su entorno real debido a situaciones como los ingresos familiares, el tamaño del hogar, etc. Esta situación provocaría que el abandono sea evidente a largo plazo, invalidando la efectividad del motor de reglas. | Como mitigación, se incluirá una declaración de responsabilidad legal en formato PDF, la cual deberá ser firmada y entregada de manera presencial para formalizar la entrega de la mascota. | Alta | Alta |
| RN2 | Negocio | Responsabilidad legal sobre el calendario de vacunación automatizado | Existe el riesgo de que la familia adoptante considere el calendario de vacunación generado por el sistema como un sustituto de la consulta con un veterinario profesional. Si ocurre una discrepancia con el criterio de un veterinario o si la mascota sufre una reacción que afecte su integridad, los usuarios podrían intentar responsabilizar legalmente a la plataforma por diagnósticos erróneos. | Como mitigación, cada calendario generado incluirá un descargo y acuerdo de responsabilidad obligatorio, aclarando que la información es de carácter preventivo, mas no un diagnóstico clínico real, y que el usuario debe validar obligatoriamente la salud de la mascota con un médico veterinario de su preferencia. | Media | Alta |
| RT1 | Técnico | Condiciones de carrera (Race Conditions) en el proceso de emparejamiento | Dado que múltiples familias pueden estar navegando y aplicando por la misma mascota simultáneamente, existe el riesgo de que el sistema permita iniciar el flujo de adopción para el mismo animal a dos procesos distintos al mismo tiempo. Si las peticiones simultáneas no se gestionan de manera correcta, puede ocurrir una duplicidad de registros en la base de datos, provocando que el sistema de recomendaciones funcione de manera incorrecta. | Para mitigar esto, se propone el uso de un servidor de colas para procesar las solicitudes de forma secuencial y asegurar la idempotencia del flujo en la base de datos. Adicionalmente, se implementará un bloqueo de registro mediante el manejo de sesiones: al ingresar la petición con menor latencia, el sistema bloqueará la mascota en la vista para otros usuarios, garantizando que un animal no pueda ser asignado a dos procesos de adopción activos simultáneamente. | Alta | Alta |
| RT2 | Técnico | Vulnerabilidad y exposición de datos de carácter personal | Debido a que la plataforma almacena información sensible de los adoptantes (identificación, direcciones residenciales y niveles de ingresos), existe el riesgo técnico de una filtración o acceso no autorizado a través de vulnerabilidades en las API. El uso indebido o la exposición de estos endpoints podría comprometer la privacidad de los usuarios y generar implicaciones legales por fuga de datos. | Como mitigación, se implementarán mecanismos de autenticación y autorización robustos (como JWT) junto con el uso de HTTPS para proteger los datos en tránsito. Adicionalmente, para los datos en reposo, se aplicará cifrado en la base de datos para la información más sensible utilizando algoritmos estándar de la industria como AES-256 y RSA asegurando así la integridad de la información. | Alta | Alta |
| RT3 | Técnico | Saturación del almacenamiento local y degradación del servidor por archivos multimedia | El sistema requiere que los refugios carguen múltiples fotografías y videos en alta resolución para cada animal que entre al proceso de adopción, lo que genera un riesgo de saturación del almacenamiento local y el colapso del servidor aplicación donde esté alojada la aplicación. | Como mitigación, se implementará una arquitectura desacoplada donde los archivos multimedia se alojarán en un proveedor de nube externo (como Amazon S3). En la base de datos solo se almacenará la URL de referencia de cada archivo. Esto garantiza que el servidor de aplicaciones no gestione archivos pesados y la base de datos se mantenga ligera. | Media | Alta |