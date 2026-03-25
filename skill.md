# Skill: Recreación del Diseño PetTech en Figma

## 1. Fundamentos de Diseño

### Paleta de Colores (HEX)
**Colores Primarios (PetTech)**
- **Orange**: `#FF8C42` (primary brand color)
- **Orange Dark**: `#E67A35` (hover states)
- **Orange Light**: `#FFAA72` (light backgrounds)
- **Yellow**: `#FFD166` (secondary accent)
- **Cream**: `#FFF8F0` (background pages)
- **Cream Dark**: `#F5EDE0` (subtle backgrounds)

**Colores Neutrales**
- **White**: `#FFFFFF` (cards, modals)
- **Gray 100**: `#F3F4F6` (borders, dividers)
- **Gray 200**: `#E5E7EB` (secondary borders)
- **Gray 300**: `#D1D5DB` (input borders)
- **Gray 400**: `#9CA3AF` (placeholder text)
- **Gray 500**: `#6B7280` (secondary text)
- **Gray 600**: `#4B5563` (body text)
- **Gray 700**: `#374151` (headings)
- **Gray 800**: `#1F2937` (primary text)

**Colores de Estado**
- **Disponible**: Fondo `#DCFCE7`, Texto `#166534`
- **En proceso**: Fondo `#FEF9C3`, Texto `#854D0E`
- **Adoptado**: Fondo `#DBEAFE`, Texto `#1E40AF`
- **No disponible**: Fondo `#FEE2E2`, Texto `#991B1B`

**Otros**
- **Overlay**: `#000000` con opacidad 40%
- **Error**: `#EF4444` (red-500)
- **Success**: `#22C55E` (green-500)

### Tipografía, Tamaños y Pesos
**Familia de Fuente**
- **Principal**: `Inter`, fallback `system-ui`, `sans-serif`

**Jerarquía Tipográfica**
- **H1** (Títulos de página): `text-2xl` (24px) / `text-3xl` (30px) en dashboard, `font-semibold` (600)
- **H2** (Subtítulos): `text-lg` (18px) / `text-xl` (20px), `font-semibold` (600)
- **H3** (Títulos de sección): `text-base` (16px), `font-semibold` (600)
- **Body**: `text-sm` (14px), `text-gray-600` o `text-gray-700`
- **Labels**: `text-sm` (14px), `font-medium` (500), `text-gray-700`
- **Captions**: `text-xs` (12px), `text-gray-400` o `text-gray-500`
- **Badges**: `text-xs` (12px), `font-medium` (500)

**Espaciado de Texto**
- **Títulos**: `mb-1` (4px) a `mb-2` (8px)
- **Párrafos**: `mt-1` (4px) entre título y descripción
- **Labels y campos**: `gap-1` (4px)

### Espaciados y Márgenes
**Sistema de Espaciado (Tailwind)**
- **Base**: 4px (1 unidad)
- **Mínimo**: `p-1` (4px), `gap-1` (4px)
- **Pequeño**: `p-2` (8px), `gap-2` (8px), `mb-2` (8px)
- **Medio**: `p-3` (12px), `gap-3` (12px), `mb-3` (12px)
- **Estándar**: `p-4` (16px), `gap-4` (16px), `mb-4` (16px), `mb-6` (24px)
- **Grande**: `p-5` (20px), `p-6` (24px), `p-8` (32px)
- **XL**: `p-8` (32px)

**Márgenes de Página**
- **Contenedor principal**: `max-w-5xl mx-auto p-6` (ancho 1024px, centrado, padding 24px)
- **Entre secciones**: `mb-6` (24px) o `mb-8` (32px)
- **Dentro de cards**: `p-4` (16px) a `p-6` (24px)

**Grids**
- **Gaps**: `gap-4` (16px) en grids de tarjetas
- **Columnas responsivas**: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`
- **Formularios**: `grid-cols-2 gap-4` para campos en fila

---

## 2. Estructura de Frames y Capas

### Layout Global
- **Frame Principal**: `App` (Viewport 1440×900)
  - **NavBar** (Top, fijo): Altura 64px (h-16), ancho completo, fondo blanco con borde inferior sutil.
  - **Contenido Principal**: `main` con ancho máximo 1024px (max-w-5xl), centrado horizontalmente, padding 24px (p-6).

### Estructura de Páginas
- **Login/Register**: Frame centrado verticalmente, ancho máximo 448px (max-w-md), padding 32px (p-8), fondo crema (bg-pettech-cream).
- **Dashboard**: Grid de tarjetas estadísticas (2-4 columnas) + Grid de acciones rápidas (1-3 columnas).
- **Listados**: Barra de filtros seguida de grid responsivo (2-4 columnas) de tarjetas.
- **Formularios**: Stepper horizontal seguido de card con formulario (ancho máximo 640px, padding 32px).
- **Modales**: Overlay con backdrop blur, card centrada (ancho máximo 448px, padding 24px).

### Jerarquía de Capas
1. **NavBar**: Logo (izquierda), Navegación (centro), Info usuario + Logout (derecha), Menú móvil (toggle).
2. **Contenido**: Título de página + Descripción, Filtros (si aplica), Grid de contenido.
3. **Componentes**: Card → Imagen + Contenido, Input → Label + Campo + Error, Botón → Icono + Texto.

---

## 3. Componentes Reutilizables

### Button
**Variantes**:
- **Primary**: Fondo `#FF8C42`, hover `#E67A35`, texto blanco, padding `py-2 px-6`, border-radius `lg` (8px)
- **Secondary**: Fondo `#FFD166`, hover `#FCD34D`, texto `text-gray-800`
- **Outline**: Borde 2px `#FF8C42`, texto `#FF8C42`, hover fondo `#FF8C42`, texto blanco

**Estados**:
- **Disabled**: Opacidad 50%, cursor no permitido
- **Loading**: Spinner + texto (opcional)

### Input
- **Campo**: `input-field` (ancho completo, border `#D1D5DB`, padding `px-4 py-2.5`, border-radius `lg`)
- **Focus**: Ring naranja `#FF8C42` con opacidad 30%, borde transparente
- **Label**: `text-sm font-medium text-gray-700`
- **Error**: `text-xs text-red-500`

### Card
- **Estilo**: Fondo blanco, `rounded-2xl`, `shadow-sm`, borde `#F3F4F6`, `overflow-hidden`
- **Hover**: `hover:shadow-md hover:-translate-y-0.5 transition-all`

### Badges de Estado
- **Disponible**: `bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs`
- **En proceso**: `bg-yellow-100 text-yellow-700`
- **Adoptado**: `bg-blue-100 text-blue-700`
- **No disponible**: `bg-red-100 text-red-700`

### Spinner
- **Tamaños**: sm (16px), md (32px), lg (48px)
- **Estilo**: `border-4 border-pettech-orange border-t-transparent rounded-full animate-spin`

### EmptyState
- **Contenido**: Icono PawPrint (48px, opacidad 30%) + mensaje `text-lg text-gray-400`
- **Padding**: `py-16`

### NavBar
- **Altura**: 64px (`h-16`)
- **Logo**: Icono PawPrint + "PetTech", color `#FF8C42`
- **Links**: `text-sm text-gray-600 hover:text-pettech-orange transition-colors`
- **Usuario**: `text-xs text-gray-500`
- **Móvil**: Menú hamburguesa, links en columna

### Stepper
- **Círculos**: `w-8 h-8 rounded-full` con número o check
- **Activos**: Fondo `#FF8C42`, texto blanco, ring `ring-4 ring-pettech-orange/30`
- **Completados**: Fondo `#FF8C42`, texto blanco con check
- **Pendientes**: Fondo `#E5E7EB`, texto `#6B7280`
- **Conectores**: `h-0.5 flex-1` con color según estado

### Modal/Dialog
- **Overlay**: `fixed inset-0 bg-black/40 backdrop-blur-sm`
- **Contenido**: Card centrada, `max-w-md`, `max-h-[90vh] overflow-y-auto`
- **Header**: Flex entre título y botón cerrar (icono X)
- **Footer**: Botones alineados a la derecha

### StatCard (Dashboard)
- **Estilo**: Card con `border-l-4` colorido
- **Contenido**: Icono grande (32px), valor `text-2xl font-bold`, label `text-sm text-gray-500`
- **Colores borde**: Naranja, verde, amarillo, azul según métrica

---

## 4. Estados de Componentes

### Botones
- **Normal**: Colores definidos por variante
- **Hover**: Color oscurecido (primary: `#E67A35`, secondary: `#FCD34D`)
- **Active**: Sutil oscurecimiento adicional
- **Disabled**: Opacidad 50%, cursor `not-allowed`, sin transiciones
- **Loading**: Spinner visible, botón deshabilitado

### Inputs
- **Normal**: Border `#D1D5DB`, fondo blanco
- **Hover**: Sin cambio visible
- **Focus**: Ring naranja `#FF8C42` con opacidad, borde transparente
- **Error**: Border rojo, mensaje de error visible
- **Disabled**: Fondo gris claro, texto gris, cursor no permitido

### Cards (MascotaCard, etc.)
- **Normal**: `bg-white rounded-2xl shadow-sm`
- **Hover**: `hover:shadow-md hover:-translate-y-0.5` (levitación sutil)
- **Active**: Mismo que hover (sin distinción visual)
- **Disabled**: No se usa en este diseño

### Checkboxes
- **Normal**: `w-4 h-4 accent-pettech-orange`
- **Checked**: Fondo naranja con check blanco
- **Focus**: Ring naranja
- **Disabled**: Opacidad 50%

### Links
- **Normal**: `text-pettech-orange hover:underline` o `text-gray-600 hover:text-pettech-orange`
- **Transition**: `transition-colors duration-200`

### Modal/Dialog
- **Backdrop**: `bg-black/40 backdrop-blur-sm`
- **Contenido**: `card` con shadow y borde
- **Cierre**: Click en backdrop o botón X

---

## 5. Iconografía
- **Librería**: Lucide React
- **Tamaños**: `w-4 h-4` (16px), `w-5 h-5` (20px), `w-6 h-6` (24px), `w-8 h-8` (32px)
- **Colores**: Heredan del texto circundante, específicos: `text-pettech-orange`, `text-gray-400`, `text-red-500`
- **Iconos usados**: PawPrint, LogOut, Menu, X, Plus, Trash2, Heart, Pencil, ArrowLeft, ArrowRight, Check, Upload, SlidersHorizontal, Users, Home, Clock, CheckCircle, ClipboardList

---

## 6. Animaciones y Transiciones
- **Duración estándar**: 200ms (`transition-all duration-200`)
- **Transiciones**: Colores, sombras, transformaciones
- **Hover en cards**: `hover:shadow-md hover:-translate-y-0.5`
- **Hover en botones**: Cambio de color de fondo
- **Spinners**: `animate-spin` (rotación infinita)
- **Backdrop blur**: `backdrop-blur-sm` en modales

---

## 7. Responsive Design
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **NavBar**: Links ocultos en móvil (`hidden sm:flex`), menú hamburguesa (`sm:hidden`)
- **Grids**: Adaptan columnas (2 → 3 → 4)
- **Cards**: Ancho completo en móvil
- **Modales**: Padding `p-4` en móvil, contenido `w-full`

---

## 8. Notas de Implementación
- **Framework**: Tailwind CSS con componentes custom en `@layer components`
- **Icons**: Lucide React, importar individualmente
- **State**: React Query para datos, Zustand para auth
- **Forms**: React Hook Form + Zod para validación
- **Toasts**: react-hot-toast para notificaciones
- **Routing**: React Router DOM v6+