# SGFR - Frontend (Sistema de Gestión de Flotas y Repartos)

Proyecto base de frontend desarrollado con **React 19**, **TypeScript**, **Vite** y **Ant Design (antd)** para la materia **Programación III**.

---

## 🚀 Tecnologías Principales

- **React 19** + **TypeScript**
- **Vite**: Bundler rápido y ligero con HMR.
- **Ant Design (antd v6 / v5)**: Librería UI principal (componentes, temas y feedback visual).
- **@ant-design/icons**: Iconografía oficial de Ant Design.
- **React Router Dom (v7)**: Enrutamiento SPA con rutas públicas y protegidas.
- **Axios**: Cliente HTTP configurado con interceptores para JWT.

---

## 📁 Estructura del Proyecto

La estructura dentro de `src/` está organizada según las buenas prácticas para proyectos modulares:

```text
src/
├── assets/          # Imágenes, íconos y recursos estáticos
├── components/      # Componentes reutilizables
│   ├── common/      # ProtectedRoute, PageHeader, etc.
│   └── layout/      # MainLayout con Sider (menú), Header, Content y Footer de AntD
├── configs/         # Configuraciones de entorno (env.config.ts) y tema AntD (theme.config.ts)
├── constants/       # Rutas (routes.constant.ts), roles y claves de LocalStorage
├── context/         # Contextos globales de React (AuthProvider y AuthContext)
├── hooks/           # Custom hooks (useAuth)
├── interfaces/      # Tipos e interfaces de TypeScript (User, Vehicle, ApiResponse, etc.)
├── pages/           # Vistas principales de la aplicación:
│   ├── home/        # Dashboard de bienvenida con estadísticas y accesos directos
│   ├── login/       # Formulario de inicio de sesión
│   ├── vehicles/    # Tabla y modal de administración de flota de vehículos
│   └── not-found/   # Pantalla 404 de Ant Design
├── routes/          # Definición centralizada de rutas (AppRouter.tsx)
├── services/        # Clientes HTTP (api.service.ts, auth.service.ts, vehicle.service.ts)
├── styles/          # Estilos globales y reset (global.css)
├── App.tsx          # ConfigProvider (AntD en español) + App context + Router
└── main.tsx         # Punto de entrada de la aplicación
```

---

## ⚙️ Configuración y Variables de Entorno

Crear o revisar el archivo `.env` en la raíz del frontend (`SRC/Frontend/sgfr/.env`):

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

## 🛠️ Comandos Disponibles

Desde la carpeta `SRC/Frontend/sgfr`:

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (por defecto en http://localhost:5173)
npm run dev

# Validar TypeScript y compilar para producción
npm run build

# Ejecutar el linter
npm run lint

# Previsualizar la compilación de producción
npm run preview
```

---

## 🔐 Autenticación y Flujo Base

1. **Estado de Sesión:** Manejado a través de `useAuth()`. Guarda el token JWT y el perfil de usuario en `localStorage`.
2. **Intercepción HTTP:** `apiClient` agrega automáticamente el token en `Authorization: Bearer <token>` y redirige al `/login` ante respuestas 401.
3. **Protección de Rutas:** El componente `ProtectedRoute` valida que el usuario esté autenticado para navegar por el panel principal y las secciones de gestión.
