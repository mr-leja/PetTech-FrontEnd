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

## Instalación
```bash
npm install
npm run dev
```
Requiere el backend corriendo en `http://localhost:8000` (o ajustar `vite.config.ts`).

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