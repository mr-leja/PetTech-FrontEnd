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

El `Dockerfile` tiene dos etapas internas:
1. **Build** — Node.js compila el código (`npm run build`) y genera la carpeta `/dist`.
2. **Producción** — Nginx sirve esa carpeta estática en el puerto 80. Node.js no queda en la imagen final.

El `nginx.conf` redirige todas las rutas a `index.html` para que React Router funcione correctamente.

### Levantar el stack completo (forma habitual)

> **Requisito único:** la red Docker debe existir antes del primer `up`. Se crea una sola vez:
> ```bash
> docker network create pettech_network
> ```

```bash
# 1. Backend (desde MVP_PetTech/)
docker-compose up -d --build

# 2. Frontend (desde MVP_FrontEnd/)
docker-compose up -d --build
```

| URL | Qué es |
|-----|--------|
| `http://localhost` | Aplicación frontend |
| `http://localhost:8000` | API Django |

### Comandos útiles del día a día

```bash
docker-compose logs -f          # ver logs en tiempo real
docker-compose down             # apagar contenedores
docker-compose up -d --build    # reconstruir tras cambios
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
