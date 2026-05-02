import { useState, useEffect } from 'react' // Se quitó 'React' del import
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import GoogleAuthButton from '../auth/GoogleAuthButton.jsx'

const Login = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  // Lógica para el carrusel de imágenes
  const [currentImg, setCurrentImg] = useState(0)

  const imagenes = [
    "/fondoRestaurante.png",
    "/fondoRestaurante2.png",
    "/fondoRestaurante3.png"
  ]

  useEffect(() => {
    const intervalo = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % imagenes.length);
    }, 15000);
    return () => clearInterval(intervalo);
  }, [imagenes.length]);

  const navigate = useNavigate()

  const getRoleRoute = (rol) => {
    const routes = {
      mesero:    '/mesas',
      cocinero:  '/cocina',
      cocina:    '/cocina',
      caja:      '/facturacion',
      cajero:    '/facturacion',
    };
    return routes[rol] || '/admin';
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser  = localStorage.getItem('authUser');
    if (storedToken) {
      axios.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      const route = storedUser
        ? getRoleRoute(JSON.parse(storedUser).rol)
        : '/admin';
      navigate(route, { replace: true });
    }
  }, [navigate]);

  // Función para manejar cambios en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', formData, { withCredentials: true });
      const { token } = res.data;

      if (token) {
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;
      }

      const authResponse = await axios.get('/auth/me', {
        withCredentials: true,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
      });
      const user = authResponse.data.user;
      localStorage.setItem('authUser', JSON.stringify(user));

      toast.success('Inicio de sesión exitoso...')
      navigate(getRoleRoute(user.rol), { replace: true })

    } catch (error) {
      // Validación para evitar el error "cannot read property data of undefined"
      const errorMsg = error.response?.data?.message || "Error de conexión con el servidor";
      console.error(errorMsg);
      toast.error(errorMsg);
    }
  }

  const btnMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row items-stretch">

      {/* Columna izquierda: imágenes — oculta en móvil, visible en md+ */}
      <section className="hidden md:block md:w-1/2 lg:w-3/5 h-screen relative flex-shrink-0">
        {imagenes.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Fondo ${index}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentImg ? "opacity-40" : "opacity-0"
            }`}
          />
        ))}
        <div id="textos-img" className="absolute bottom-16 left-8 lg:left-16 p-4 flex flex-col gap-3 max-w-xs lg:max-w-sm">
          <h1 className="text-2xl lg:text-4xl text-yellow-500 font-bold leading-tight">
            Lleva tu restaurante al siguiente nivel
          </h1>
          <span className="text-gray-300 text-sm lg:text-base">
            Meetech es un software de gestión para restaurantes, siente la diferencia con nuestra solución integral.
          </span>
        </div>
      </section>

      {/* Columna derecha: formulario — ancho completo en móvil, mitad en md+ */}
      <section className="w-full md:w-1/2 lg:w-2/5 min-h-screen bg-gray-200 flex flex-col justify-center items-center px-6 py-10 md:py-0 overflow-y-auto">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Bienvenido a MeeTech</h1>
          <h3 className="text-gray-700 mb-6 text-center text-sm">Ingresa tus datos para continuar</h3>

          <form onSubmit={handleSubmit} className="flex flex-col w-full">

            <div className="flex flex-col mb-4">
              <label htmlFor="email" className="pl-2 font-bold text-sm">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="Ingrese su email"
                onChange={handleChange}
                value={formData.email}
                className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                required
              />
            </div>

            <div className="flex flex-col mb-4">
              <div className="flex justify-between items-center">
                <label htmlFor="contrasena" className="pl-2 font-bold text-sm">Contraseña</label>
                <a href="#" className="text-blue-500 text-xs hover:underline">¿Olvidaste tu contraseña?</a>
              </div>

              <div className="relative">
                <input
                  id="contrasena"
                  type={mostrarPassword ? "text" : "password"}
                  name="password"
                  placeholder="Ingrese su contraseña"
                  onChange={handleChange}
                  value={formData.password}
                  className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={btnMostrarPassword}
                  className="absolute right-3 top-2.5"
                >
                  {mostrarPassword
                    ? <EyeOff size={20} className="text-blue-600 cursor-pointer" />
                    : <Eye size={20} className="text-blue-600 cursor-pointer" />
                  }
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors duration-300 cursor-pointer mt-2 text-sm"
            >
              Iniciar Sesión
            </button>

            <div className="mt-4">
              <GoogleAuthButton label="Continuar con Google" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-gray-700 text-sm">
                ¿No tienes cuenta?{' '}
                <Link to="/register" className="text-blue-500 font-bold hover:underline">
                  Regístrate aquí
                </Link>
              </p>
            </div>

            <ul className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-1">
              <li className="text-gray-600 text-xs"><a href="#" className="hover:underline">privacy policy</a></li>
              <li className="text-gray-600 text-xs"><a href="#" className="hover:underline">terms of service</a></li>
              <li className="text-gray-600 text-xs"><a href="#" className="hover:underline">contact us</a></li>
            </ul>
          </form>
        </div>
      </section>
    </div>
  )
}

export default Login