# PetTech Frontend - Instrucciones para Agentes

## Comandos de Build, Lint y Test

**Servidor de desarrollo**: `npm run dev`
- Inicia Vite en el puerto 5173 con proxy al backend en `localhost:8000`.

**Build**: `npm run build`
- Ejecuta la compilación de TypeScript (`tsc`) y luego la build de Vite.
- Salida en `dist/`.

**Preview del build**: `npm run preview`
- Sirve la aplicación construida localmente.

**Tests**: `npm run test`
- Ejecuta Vitest en modo watch.
- Un solo test: `npx vitest run ruta/al/archivo.test.ts`
- Con UI: `npm run test:ui` (requiere `@vitest/ui`).

**Verificación de tipos**: `npx tsc --noEmit`
- Ya incluido en el script de build.

No hay un script de lint dedicado; usar el modo estricto de TypeScript (`tsconfig.json: "strict": true`).

## Guía de Estilo de Código

### Importaciones
- Usar rutas absolutas con el alias `@/` (`@/shared/components/Button`).
- Agrupar importaciones: librerías de React primero, luego importaciones locales.
- Preferir `import type` para interfaces/tipos de TypeScript.
- Evitar exportaciones por defecto para utilidades; usar exportaciones nombradas.

### Formato
- Prettier no está configurado; seguir el estilo existente:
  - Indentación de 2 espacios.
  - Comillas simples para cadenas.
  - Sin comas al final.
  - Llaves de apertura en la misma línea.
  - Sin punto y coma (opcional; el código los usa inconsistente‑mente — seguir el archivo existente).

### Tipos e Interfaces
- Definir tipos explícitos para props, payloads de API y estado del store.
- Usar `zod` para validación en tiempo de ejecución (formularios, inputs de API).
- Preferir `interface` para props de componentes, `type` para uniones/intersecciones.
- Exportar tipos que se usen fuera del módulo.

### Convenciones de Nombres
- **Archivos**: PascalCase para componentes (`Button.tsx`), camelCase para utilidades (`httpClient.ts`).
- **Componentes**: PascalCase (`MascotaCard`).
- **Funciones/variables**: camelCase (`fetchMascotas`, `isAuthenticated`).
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`).
- **Hooks personalizados**: `useAuthStore`, patrón `useQuery`.

### Manejo de Errores
- Errores de API: capturar en el componente, mostrar con `react-hot-toast`.
- Errores de formulario: usar `react-hook-form` + resolvedor `zod`; mostrar bajo los inputs.
- Manejo global de 401 en el interceptor de `httpClient` (logout + redirección).
- Nunca exponer mensajes de error crudos al UI; usar strings amigables para el usuario.

### Patrones de Componentes
- Solo componentes funcionales.
- Usar `React.forwardRef` para inputs de formulario.
- Interfaces de props nombradas `ComponentProps` o `Props` (local).
- Desestructurar props en la firma de la función.
- Preferir prop `className` sobre estilos en línea.
- Usar clases utilitarias de Tailwind; estilos personalizados en `@layer components`.

### Manejo de Estado
- Estado del servidor: `@tanstack/react-query` (queries, mutations).
- Estado del cliente: Zustand (`useAuthStore`).
- Estado del formulario: `react-hook-form` con validación `zod`.
- Estado UI local: `useState`.

### Capa de API
- `httpClient` centralizado con Axios.
- Cada feature tiene una carpeta `api/` con funciones tipadas.
- Siempre devolver `Promise<T>` desde funciones de API.
- Manejar FormData vs JSON automáticamente.

### Testing (cuando se agregue)
- Usar Vitest + React Testing Library.
- Archivos de test en `__tests__/` o co‑localizados `*.test.tsx`.
- Mock de llamadas a API con `vi.mock`.
- Enfocarse en interacciones del usuario y salida visible.

### Seguridad
- Nunca registrar tokens o secretos.
- JWT almacenado en persist de Zustand (localStorage).
- Auto‑logout en 401.
- Validar toda entrada de usuario con zod.

### Errores Comunes
- Recordar la opción `enabled` en `useQuery` para fetching condicional.
- Usar `onStopPropagation` para triggers de modales dentro de cards.
- Limpiar `URL.createObjectURL` para previews de archivos.
- Verificar el estado `mounted` antes de setear estado después de operaciones async.

## Estructura del Proyecto
```
src/
├── features/               # Módulos de features
│   ├── auth/               # Login, Register
│   ├── mascotas/           # Gestión de mascotas
│   ├── familias/           # Perfiles de familias
│   ├── adopciones/         # Proceso de adopción
│   └── dashboard/          # Dashboard principal
├── shared/                 # Reutilizable entre features
│   ├── api/                # httpClient, interceptores
│   ├── components/         # Button, Input, NavBar, etc.
│   ├── store/              # Stores de Zustand (authStore)
│   └── hooks/              # Hooks personalizados (si hay)
├── router/                 # AppRouter, definiciones de rutas
├── App.tsx                 # Componente raíz
├── main.tsx                # Punto de entrada
└── index.css               # Base de Tailwind y componentes personalizados
```

## Archivos de Configuración Clave
- `tailwind.config.js`: Colores personalizados (`pettech-*`), familia de fuente Inter.
- `vite.config.ts`: Alias de rutas `@/` → `src/`, proxy al backend.
- `tsconfig.json`: Modo estricto, alias de rutas, target ES2020.
- `postcss.config.js`: Tailwind + Autoprefixer.

## Variables de Entorno
No se encontraron archivos `.env`; la configuración está en `vite.config.ts`. El objetivo del proxy de API es `http://localhost:8000`.

## Despliegue
- `npm run build` genera salida en `dist/`.
- Servir archivos estáticos con cualquier servidor web; asegurar proxy de API o CORS configurado.
- Backend esperado en `/api/v1` (ver baseURL de `httpClient`).

## Patrones de Ejemplo

### Crear un nuevo componente de página
```tsx
import { useQuery } from '@tanstack/react-query'
import NavBar from '@/shared/components/NavBar'

export default function MiPagina() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['miClave'],
    queryFn: () => api.obtenerDatos(),
  })

  return (
    <div className="min-h-screen bg-pettech-cream">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6">
        {/* Contenido */}
      </main>
    </div>
  )
}
```

### Formulario con react-hook-form + zod
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/shared/components/Input'
import Button from '@/shared/components/Button'

const schema = z.object({ nombre: z.string().min(1) })
type DatosFormulario = z.infer<typeof schema>

export default function MiFormulario() {
  const { register, handleSubmit, formState: { errors } } = useForm<DatosFormulario>({
    resolver: zodResolver(schema),
  })
  const onSubmit = (data: DatosFormulario) => { /* ... */ }
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Nombre" error={errors.nombre?.message} {...register('nombre')} />
      <Button type="submit">Enviar</Button>
    </form>
  )
}
```

## Recursos
- [React Query docs](https://tanstack.com/query/latest)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

## Notas para Agentes
- Siempre ejecutar `tsc --noEmit` después de hacer cambios de TypeScript.
- Probar con `npx vitest run` si existe un archivo de test para el feature.
- Seguir patrones de importación existentes; revisar archivos vecinos para ejemplos.
- Al agregar nuevos componentes, considerar si pertenecen en `shared/components` o en la carpeta del feature.
- Usar `react-hot-toast` para notificaciones al usuario; evitar alert/console.
- Para subida de archivos, revisar el manejo de FormData en `httpClient`.
- Recordar manejar estados de loading/error en las queries.