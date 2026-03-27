import { useState, useEffect } from 'react' 
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'
import GoogleAuthButton from '../auth/GoogleAuthButton.jsx'

const Register = () => {
    const [mostrarPassword, setMostrarPassword] = useState(false)

    const [formData, setFormData] = useState({
        nombre: "",
        email: "",
        telefono: "",
        password: ""
    })

    // Lógica para el carrusel de imágenes
    const [currentImg, setCurrentImg] = useState(0)

    const imagenes = [
        "./public/fondoRestaurante.png",
        "./public/fondoRestaurante2.png",
        "./public/fondoRestaurante3.png"
    ]

    useEffect(() => {
        const intervalo = setInterval(() => {
            setCurrentImg((prev) => (prev + 1) % imagenes.length);
        }, 15000);
        return () => clearInterval(intervalo);
    }, [imagenes.length]);

    const navigate = useNavigate()

    // Función para manejar cambios en los campos del formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/register', formData);
            toast.success('Cuenta creada con éxito. Ya puedes iniciar sesión.')
            navigate('/login')
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error al registrarse';
            toast.error(errorMsg)
        }
    }

    const btnMostrarPassword = () => {
        setMostrarPassword(!mostrarPassword)
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col md:flex-row items-stretch">

            {/* Sección Izquierda - Imagen y Texto — oculta en móvil */}
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
                        Únete a la revolución culinaria
                    </h1>
                    <span className="text-gray-300 text-sm lg:text-base">
                        Forma parte de MeeTech y optimiza cada proceso de tu negocio con tecnología de punta.
                    </span>
                </div>
            </section>

            {/* Sección Derecha - Formulario — ancho completo en móvil, mitad en md+ */}
            <section className="w-full md:w-1/2 lg:w-2/5 min-h-screen bg-gray-200 flex flex-col justify-center items-center px-6 py-10 md:py-6 overflow-y-auto">
                <div className="w-full max-w-sm">
                    <h1 className="text-2xl font-bold text-blue-600 mb-2 text-center">Crea tu cuenta en MeeTech</h1>
                    <h3 className="text-gray-700 mb-5 text-center text-sm">Completa los datos para registrarte</h3>

                    <form
                        id="container-inputs"
                        onSubmit={handleSubmit}
                        className="flex flex-col w-full">

                        {/* Nombre */}
                        <div className="flex flex-col mb-3">
                            <label htmlFor="nombre" className="pl-2 font-bold text-sm">Nombre completo</label>
                            <input
                                id="nombre"
                                type="text"
                                name="nombre"
                                placeholder="Tu nombre completo"
                                onChange={handleChange}
                                value={formData.nombre}
                                required
                                className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="flex flex-col mb-3">
                            <label htmlFor="email" className="pl-2 font-bold text-sm">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="email@ejemplo.com"
                                onChange={handleChange}
                                value={formData.email}
                                required
                                className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                            />
                        </div>

                        {/* Teléfono */}
                        <div className="flex flex-col mb-3">
                            <label htmlFor="telefono" className="pl-2 font-bold text-sm">Teléfono</label>
                            <input
                                id="telefono"
                                type="tel"
                                name="telefono"
                                placeholder="Ej: +57 300..."
                                onChange={handleChange}
                                value={formData.telefono}
                                required
                                className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                            />
                        </div>

                        {/* Contraseña */}
                        <div className="flex flex-col mb-5">
                            <label htmlFor="contrasena" className="pl-2 font-bold text-sm">Contraseña</label>
                            <div className="relative">
                                <input
                                    id="contrasena"
                                    type={mostrarPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Crea una contraseña segura"
                                    onChange={handleChange}
                                    value={formData.password}
                                    required
                                    className="w-full p-2.5 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50 text-sm"
                                />
                                <button type="button" onClick={btnMostrarPassword} className="absolute right-3 top-2.5">
                                    {mostrarPassword
                                        ? <EyeOff size={20} className="text-blue-600 cursor-pointer" />
                                        : <Eye size={20} className="text-blue-600 cursor-pointer" />
                                    }
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl transition-colors duration-300 cursor-pointer font-bold text-sm"
                        >
                            Registrarme
                        </button>

                        <div className="mt-4">
                            <GoogleAuthButton label="Registrarme con Google" />
                        </div>

                        <div id="ruta-login" className="mt-5 text-center">
                            <p className="text-gray-700 text-sm">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-blue-500 font-bold hover:underline">
                                    Inicia sesión aquí
                                </Link>
                            </p>
                        </div>

                        <ul className="mt-5 flex flex-wrap justify-center gap-x-4 gap-y-1">
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

export default Register