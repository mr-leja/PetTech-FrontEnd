# PetTech Frontend

React 18 + TypeScript + Vite + TailwindCSS — interfaz de usuario para el sistema de adopciones PetTech.

## Stack
- React 18, TypeScript (strict)
- Vite 5
- TailwindCSS 3
- TanStack Query (server state)
- Zustand (client state / auth)
- React Hook Form + Zod (validación)
- Axios (HTTP client con interceptores JWT)

---

## Desarrollo local

### Requisitos
- Node.js ≥ 20
- Backend corriendo en `http://localhost:8000`

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # build de producción en /dist
npm test             # tests unitarios con Vitest
npm run test -- --coverage  # cobertura
```

---

## Docker

### Construcción manual

```bash
# Construir la imagen de producción (Nginx)
docker build -t pettech-frontend .

# Ejecutar en el puerto 80
docker run -d --name pettech_frontend -p 80:80 pettech-frontend

# Ver logs
docker logs -f pettech_frontend

# Detener y eliminar
docker stop pettech_frontend && docker rm pettech_frontend
```

### Docker Compose (con red compartida del backend)

```bash
# Asegúrate de que la red externa existe (una sola vez)
docker network create pettech_network

# Levantar el frontend
docker-compose up -d --build

# Ver logs
docker-compose logs -f

# Bajar
docker-compose down
```

> La imagen de producción usa **Nginx 1.27** como servidor estático. El `nginx.conf`
> redirige todas las rutas a `index.html` para que React Router funcione correctamente.

### Stack completo (frontend + backend)

```bash
# En MVP_PetTech/
docker-compose up -d --build   # backend + DB

# En MVP_FrontEnd/
docker-compose up -d --build   # frontend

# Acceder:  http://localhost       (frontend)
#           http://localhost:8000  (API Django)
```

---

## Páginas implementadas
| Ruta | Descripción | Roles |
|------|-------------|-------|
| `/login` | Login con JWT | Público |
| `/registro` | Registro 3 pasos: cuenta → familia → hogar | Público |
| `/dashboard` | Panel principal con estadísticas | Todos |
| `/mascotas` | Listado con filtros y modal detalle | Todos |
| `/mascotas/nueva` | Formulario registro mascota + foto | Solo ADMIN |
| `/mi-familia` | Registro datos familia (HU-04) | FAMILIA |
| `/mi-familia/hogar` | Condiciones del hogar + acuerdo (HU-05) | FAMILIA |

## Paleta de colores
- Naranja: `#FF8C42`
- Amarillo: `#FFD166`
- Crema: `#FFF8F0`

## Flujo de registro multi-paso
```
Paso 1: email + contraseña → auto-login
Paso 2: datos familia (HU-04)  
Paso 3: condiciones del hogar + acuerdo responsabilidad (HU-05)
→ Redirige al Dashboard con perfil_completo = true
```

## Link de Figma
https://www.figma.com/design/N3uFMRskP6nqZwSOIIhts3/PetTech?node-id=1-4&t=6tUKtNtnuSGaHvn6-1
