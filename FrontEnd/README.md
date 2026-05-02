# MeeTech Frontend 🎨

**Interfaz de usuario interactiva para la gestión de restaurante MeeTech**

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Configuración](#instalación-y-configuración)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Variables de Entorno](#variables-de-entorno)
- [Rutas de la Aplicación](#rutas-de-la-aplicación)
- [Estructura de Componentes](#estructura-de-componentes)
- [Autenticación](#autenticación)
- [Comunicación con Backend](#comunicación-con-backend)
- [Control de Acceso por Rol](#control-de-acceso-por-rol)
- [Flujos de Usuario](#flujos-de-usuario)
- [Scripts Disponibles](#scripts-disponibles)
- [Guía de Desarrollo](#guía-de-desarrollo)
- [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

MeeTech Frontend es una **Single Page Application (SPA)** construida con **React 19 y Vite** que proporciona una interfaz moderna y responsiva para:

- 🔐 **Autenticación**: Login, registro y OAuth con Google
- 📊 **Panel de Control**: Dashboard administrativo con métricas
- 🍽️ **Gestión de Mesas**: Control visual de mesas del restaurante
- 🍳 **Panel de Cocina**: Seguimiento de pedidos en cocina
- 💰 **Facturación**: Generación y gestión de facturas
- 👥 **Control de Acceso**: Multi-rol (Admin, Mesero, Cocinero, Caja)

### Características Clave
✅ SPA con rutas protegidas mediante tokens JWT  
✅ Autenticación con emails/contraseñas y OAuth Google  
✅ Diseño responsivo con Tailwind CSS v4  
✅ Componentes reutilizables y modulares  
✅ Comunicación via Axios con interceptores  
✅ Notificaciones visuales con Sonner  
✅ Control de acceso basado en roles (RBAC)  
✅ Hot Module Reload (HMR) en desarrollo

---

## 🛠️ Stack Tecnológico

| Herramienta | Versión | Propósito |
|-------------|---------|----------|
| **React** | ^19.2.0 | Framework UI |
| **Vite** | ^7.3.1 | Build tool y dev server |
| **Tailwind CSS** | ^4.2.1 | Estilos CSS |
| **React Router DOM** | ^7.13.1 | Enrutamiento SPA |
| **Axios** | ^1.13.6 | Cliente HTTP |
| **JWT Decode** | ^4.0.0 | Decodificación de tokens |
| **Sonner** | ^2.0.7 | Notificaciones toast |
| **Lucide React** | ^0.575.0 | Iconos vectoriales |
| **@react-oauth/google** | ^0.13.4 | Integración OAuth Google |
| **Supabase JS** | ^2.104.1 | Cliente Supabase |
| **ESLint** | ^9.39.1 | Linter de código |

---

## 📦 Requisitos Previos

- **Node.js** 18+ y npm/yarn instalados
- **Backend MeeTech** ejecutándose en el puerto 3000
- **Variables de entorno** configuradas (ver sección de configuración)
- **Git** para versionado

---

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <URL-del-repositorio>
cd MeeTech-FrontEnd/FrontEnd
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Crear archivo `.env`
En la raíz del proyecto (`MeeTech-FrontEnd/FrontEnd/.env`), crea:

```env
# API Backend
VITE_API_BASE_URL=http://localhost:3000

# Google OAuth (opcional)
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com

# Supabase (si se usa)
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

### 4. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
MeeTech-FrontEnd/FrontEnd/
├── src/
│   ├── assets/                      # 🖼️ Imágenes y recursos estáticos
│   │   └── ...
│   │
│   ├── components/
│   │   ├── admin/                   # 📊 Componentes del Panel Admin
│   │   │   ├── AdminDashboard.jsx   # Vista principal del admin
│   │   │   ├── AdminLayout.jsx      # Layout con Sidebar
│   │   │   ├── Dashboard.jsx        # Panel de métricas
│   │   │   ├── EmpleadosPanel.jsx   # Gestión de empleados
│   │   │   ├── FacturaModal.jsx     # Modal de facturas
│   │   │   ├── Sidebar.jsx          # Menú lateral
│   │   │   ├── TableManagement.jsx  # Gestión de mesas
│   │   │   ├── TurnoGuard.jsx       # Validación de turnos
│   │   │   └── ...más componentes
│   │   │
│   │   ├── auth/                    # 🔐 Autenticación
│   │   │   ├── GoogleCallback.jsx   # Callback OAuth Google
│   │   │   └── ProtectedRoute.jsx   # Componente protector de rutas
│   │   │
│   │   ├── caja/                    # 💰 Panel de Facturación
│   │   │   ├── CajaPanel.jsx
│   │   │   └── ...más componentes
│   │   │
│   │   ├── cocina/                  # 🍳 Panel de Cocina
│   │   │   ├── CocinaPanel.jsx
│   │   │   └── ...más componentes
│   │   │
│   │   ├── dasboard/                # 📈 Dashboard General
│   │   │   ├── Home.jsx
│   │   │   └── ...más componentes
│   │   │
│   │   ├── login/                   # 🔑 Login
│   │   │   ├── Login.jsx
│   │   │   └── ...más componentes
│   │   │
│   │   └── signUp/                  # 📝 Registro
│   │       ├── SignUp.jsx
│   │       └── ...más componentes
│   │
│   ├── config/
│   │   ├── axiosConfig.js           # ⚙️ Configuración de Axios
│   │   └── ...más configuraciones
│   │
│   ├── utils/
│   │   ├── alerts.jsx               # 🔔 Utilidades de alertas
│   │   └── ...más utilidades
│   │
│   ├── App.jsx                      # 🎯 Componente raíz con rutas
│   ├── main.jsx                     # 🚀 Punto de entrada React
│   ├── index.css                    # 🎨 Estilos globales
│   └── supabaseClient.js            # 🔗 Cliente Supabase (si se usa)
│
├── public/                          # Archivos públicos estáticos
├── .env                             # ⚙️ Variables de entorno
├── .gitignore                       # Git exclusiones
├── eslint.config.js                 # ESLint config
├── vite.config.js                   # Vite config
├── package.json                     # Dependencias y scripts
├── package-lock.json
└── README.md                        # Este archivo
```

---

## ⚙️ Variables de Entorno

### URL del Backend
```env
VITE_API_BASE_URL=http://localhost:3000
```
- En desarrollo: `http://localhost:3000`
- En producción: La URL de tu servidor en la nube

### Google OAuth (Opcional)
```env
VITE_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```
Obtén este ID de [Google Cloud Console](https://console.cloud.google.com/)

### Supabase (Opcional)
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

---

## 🛣️ Rutas de la Aplicación

### Rutas Públicas (Sin Autenticación)
```
/              → Login (página de inicio)
/login         → Página de login
/register      → Página de registro
/auth/callback → Callback de OAuth Google
/home          → Dashboard general (posiblemente sin protección)
```

### Rutas Protegidas (Requieren Token JWT)
```
/admin         → Panel principal de administrador
/admin/*       → Sub-rutas administrativas
/mesas         → Gestión de mesas (Mesero)
/cocina        → Panel de cocina (Cocinero)
/facturacion   → Panel de facturación (Caja)
```

### Comportamiento
- Si intentas acceder a una ruta protegida sin token → Rediriges a `/login`
- Si el token está expirado → Axios interceptor limpia el localStorage y redirige
- Si no tienes autorización por rol → El Sidebar no muestra esa opción

---

## 🧩 Estructura de Componentes

### Componentes de Nivel Alto

#### **App.jsx**
```jsx
- Define todas las rutas de la aplicación
- Configura el Router y Toaster (notificaciones)
- Importa axiosConfig para configurar Axios globalmente
- Envuelve rutas protegidas con <ProtectedRoute>
```

#### **AdminLayout.jsx**
```jsx
- Layout compartido para rutas administrativas
- Contiene el Sidebar y un <Outlet> para sub-rutas
- Se renderiza en /mesas, /cocina, /facturacion
```

#### **ProtectedRoute.jsx**
```jsx
- Valida que exista token JWT en localStorage
- Verifica que el token no esté expirado
- Redirige a /login si falla la validación
- Limpia datos si hay problemas
```

### Componentes de Autenticación

#### **Login.jsx**
```jsx
- Formulario de login con email/contraseña
- Botón "Continuar con Google" (OAuth)
- POST /api/login si es login tradicional
- Guardar token en localStorage.authToken
- Redirigir a /admin con replace: true
```

#### **SignUp.jsx**
```jsx
- Formulario de registro
- POST /api/register
- Validación de campos
- Redirige a /login o direcamente al login
```

#### **GoogleCallback.jsx**
```jsx
- Componente intermedio después de OAuth
- Extrae el token de la URL
- Lo guarda en localStorage
- Redirige a /admin
```

### Componentes de Admin

#### **AdminDashboard.jsx**
```jsx
- Vista principal del panel de admin
- Muestra métricas y resumen
- Self-contained con su propio sidebar
```

#### **Sidebar.jsx**
```jsx
- Menú lateral de navegación
- Filtra opciones según rol del usuario
- Botón "Cerrar Sesión" para hacer logout
```

#### **TableManagement.jsx**
```jsx
- Gestión visual de mesas
- Muestra estado de cada mesa
- Permite crear/editar mesas
```

#### **CocinaPanel.jsx** y **CajaPanel.jsx**
```jsx
- Paneles específicos para cocineros y caja
- Interfaces diseñadas para sus tareas
```

---

## 🔐 Autenticación

### Flujo de Login

```
1. Usuario ingresa credenciales en Login.jsx
   ↓
2. POST /api/login con { email, contraseña }
   ↓
3. Backend responde con { token, usuario }
   ↓
4. Frontend:
   - localStorage.setItem('authToken', token)
   - localStorage.setItem('authUser', JSON.stringify(usuario))
   - axios.defaults.headers.Authorization = `Bearer ${token}`
   ↓
5. Navegar a /admin con replace: true
   ↓
6. ProtectedRoute valida el token
   ↓
7. AdminLayout se renderiza con Sidebar
```

### Flujo de OAuth Google

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. Redirige a /api/auth/google
   ↓
3. Backend redirige a Google OAuth
   ↓
4. Usuario autoriza en Google
   ↓
5. Google redirige a /api/auth/google/callback
   ↓
6. Backend procesa y redirige a /auth/callback?token=xxx
   ↓
7. GoogleCallback.jsx extrae el token de la URL
   ↓
8. Lo guarda en localStorage
   ↓
9. Rediriges a /admin
```

### Logout

```
1. Usuario hace clic en "Cerrar Sesión" en el Sidebar
   ↓
2. handleLogout() elimina:
   - localStorage.authToken
   - localStorage.authUser
   - axios.defaults.headers.Authorization
   ↓
3. POST /api/auth/logout (opcional)
   ↓
4. navigate('/login', { replace: true })
   ↓
5. Historial se limpia (no puede volver atrás)
```

---

## 🌐 Comunicación con Backend

### Configuración de Axios

**Archivo: `src/config/axiosConfig.js`**

```javascript
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// URL base del API
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;

// Enviar credenciales (cookies)
axios.defaults.withCredentials = true;

// Interceptor de request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response (manejo de errores)
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      // Redirigir a login
    }
    return Promise.reject(error);
  }
);
```

### Ejemplos de Llamadas

#### **Login**
```javascript
const response = await axios.post('/api/login', {
  email: 'usuario@example.com',
  contraseña: '123456'
});
// Respuesta: { token, usuario }
```

#### **Obtener Datos**
```javascript
const response = await axios.get('/api/productos');
// Incluye automáticamente Authorization header
```

#### **Crear Registro**
```javascript
const response = await axios.post('/api/empleados', {
  nombre: 'Juan',
  email: 'juan@example.com',
  rol_id: 2
});
```

#### **Actualizar**
```javascript
const response = await axios.put('/api/mesas/5', {
  estado: 'ocupada'
});
```

---

## 👥 Control de Acceso por Rol

### Roles Disponibles

| Rol | ID | Acceso | Menú Visible |
|-----|----|---------|----|
| Admin | 1 | Todo | Dashboard, Empleados, Productos, Mesas, Cocina, Facturación, Reportes |
| Mesero | 2 | Mesas y Pedidos | Solo Gestión de Mesas |
| Cocinero | 3 | Panel de Cocina | Solo Panel de Cocina |
| Caja | 4 | Facturación | Solo Facturación |

### Implementación en Sidebar

```javascript
// El Sidebar decodifica el token para obtener el rol
const token = localStorage.getItem('authToken');
const decoded = jwtDecode(token);
const userRole = decoded.rol;

// Renderiza opciones según el rol
{userRole === 1 && <AdminOptions />}
{userRole === 2 && <MeseroOptions />}
{userRole === 3 && <CocinerOptions />}
{userRole === 4 && <CajaOptions />}
```

---

## 👤 Flujos de Usuario

### Flujo Admin
```
1. Login → /login
2. Ingresa credenciales
3. Redirige a /admin
4. Ve Dashboard con todas las opciones
5. Puede gestionar empleados, productos, etc.
6. Logout → /login
```

### Flujo Mesero
```
1. Login → /login
2. Ingresa credenciales con rol 2
3. Redirige a /admin
4. Sidebar solo muestra "Gestión de Mesas"
5. Navega a /mesas
6. Gestiona mesas y crea pedidos
```

### Flujo Cocinero
```
1. Login → /login
2. Ingresa credenciales con rol 3
3. Redirige a /admin
4. Sidebar solo muestra "Panel de Cocina"
5. Navega a /cocina
6. Ve pedidos pendientes y cambia estados
```

### Flujo Caja
```
1. Login → /login
2. Ingresa credenciales con rol 4
3. Redirige a /admin
4. Sidebar solo muestra "Facturación"
5. Navega a /facturacion
6. Genera y gestiona facturas
```

---

## 📜 Scripts Disponibles

### Desarrollo
```bash
npm run dev
```
Inicia el servidor de desarrollo con HMR (Hot Module Reload)

### Build (Producción)
```bash
npm run build
```
Compila la aplicación para producción

### Preview
```bash
npm run preview
```
Vista previa localmente del build de producción

### Linting
```bash
npm run lint
```
Ejecuta ESLint para revisar el código

---

## 👨‍💻 Guía de Desarrollo

### Crear un Nuevo Componente

1. **Crear el archivo** en `src/components/<categoria>/MiComponente.jsx`
2. **Estructura base**:
   ```jsx
   import React, { useState, useEffect } from 'react';
   import axios from 'axios';

   function MiComponente() {
     const [data, setData] = useState([]);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
       fetchData();
     }, []);

     const fetchData = async () => {
       try {
         setLoading(true);
         const response = await axios.get('/api/endpoint');
         setData(response.data);
       } catch (error) {
         console.error('Error:', error);
       } finally {
         setLoading(false);
       }
     };

     return (
       <div className="p-4">
         {/* JSX aquí */}
       </div>
     );
   }

   export default MiComponente;
   ```

3. **Importar en App.jsx** o en el componente padre
4. **Usar Tailwind CSS** para estilos

### Agregar una Nueva Ruta

1. **En App.jsx**:
   ```jsx
   <Route path='/mi-nueva-ruta' element={
     <ProtectedRoute><MiComponente /></ProtectedRoute>
   } />
   ```

2. **Agregar al Sidebar** si es necesario:
   ```jsx
   {userRole === 1 && (
     <Link to="/mi-nueva-ruta">Mi Nueva Ruta</Link>
   )}
   ```

### Usar Notificaciones (Sonner)

```javascript
import { toast } from 'sonner';

// Éxito
toast.success('¡Guardado exitosamente!');

// Error
toast.error('Ocurrió un error');

// Info
toast.info('Información');

// Custom
toast.custom((t) => (
  <div>Contenido personalizado</div>
));
```

### Decodificar JWT

```javascript
import { jwtDecode } from 'jwt-decode';

const token = localStorage.getItem('authToken');
const decoded = jwtDecode(token);

console.log(decoded.id);      // ID usuario
console.log(decoded.email);   // Email
console.log(decoded.rol);     // Rol (1, 2, 3, 4)
console.log(decoded.exp);     // Timestamp de expiración
```

---

## 🚨 Troubleshooting

### ❌ Error: "Cannot find module axios"
**Solución:**
```bash
npm install axios
```

### ❌ Error: "Token not found" después de login
**Solución:**
- Verifica que `localStorage` esté habilitado
- Revisa que el backend responde con `{ token, usuario }`
- Comprueba la consola del navegador

### ❌ Rediriges constantemente a /login
**Solución:**
- El token está expirado: haz logout y login de nuevo
- Verifica que `localStorage.getItem('authToken')` retorna un valor
- Comprueba que el token JWT es válido en [jwt.io](https://jwt.io)

### ❌ Componentes no se cargan
**Solución:**
- Verifica que el componente está importado en App.jsx
- Comprueba que la ruta está correctamente definida
- Abre la consola del navegador para ver errores

### ❌ Estilos de Tailwind no se aplican
**Solución:**
```bash
npm run dev
```
Reinicia el servidor de desarrollo

### ❌ CORS error en las llamadas a API
**Solución:**
- Verifica que `VITE_API_BASE_URL` esté correcta
- Asegúrate que el backend está corriendo
- Comprueba que axios tiene `withCredentials: true`

### ❌ OAuth Google no funciona
**Solución:**
- Verifica `VITE_GOOGLE_CLIENT_ID` en `.env`
- Confirma que el dominio está autorizado en Google Console
- Revisa que el callback URL es correcto

---

## 📚 Recursos Adicionales

- [Documentación de React](https://react.dev/)
- [Documentación de Vite](https://vite.dev/)
- [Documentación de Tailwind CSS](https://tailwindcss.com/)
- [Documentación de React Router](https://reactrouter.com/)
- [Documentación de Axios](https://axios-http.com/)
- [Documentación Completa del Proyecto](../../DOCUMENTATION.md)
- [Guía de Autenticación](../../AUTH_SETUP_GUIDE.md)

---

## 👥 Información del Proyecto

**Versión Actual:** 0.0.0  
**Estado:** En desarrollo  
**Autor:** Equipo MeeTech SENA  
**Licencia:** MIT

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Crear un [issue en GitHub](#)
2. Contactar al equipo de desarrollo
3. Revisar la documentación en `DOCUMENTATION.md`

---

**Última actualización:** 2 de mayo de 2026
