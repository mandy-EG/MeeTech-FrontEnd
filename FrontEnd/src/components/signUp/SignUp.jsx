import { useState, useEffect } from 'react' 
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'sonner'

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
        <div className="h-screen bg-gray-900 flex items-center justify-center">
            {/* Sección Izquierda - Imagen y Texto */}
            <section className="h-screen w-full relative">
                {imagenes.map((img, index) => (
                    <img
                        key={index}
                        src={img}
                        alt={`Fondo ${index}`}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${index === currentImg ? "opacity-40" : "opacity-0"
                            }`}
                    />
                ))}
                <div id="textos-img" className='w-1/3 flex flex-col absolute bottom-50 left-20 p-4 gap-2'>
                    <h1 className="text-4xl text-yellow-600 font-bold">Únete a la revolución culinaria</h1>
                    <span className="text-gray-300">Forma parte de MeeTech y optimiza cada proceso de tu negocio con tecnología de punta.</span>
                </div>
            </section>

            {/* Sección Derecha - Formulario */}
            <section className="bg-gray-200 w-2/3 h-screen flex flex-col justify-center items-center overflow-y-auto">
                <h1 className="text-2xl font-bold text-blue-600 mb-6">Crea tu cuenta en MeeTech</h1>

                <h3 className="text-gray-700 mb-4">Completa los datos para registrarte</h3>

                <form
                    id="container-inputs"
                    onSubmit={handleSubmit}
                    className='flex flex-col w-2/3'>

                    {/* Nombre */}
                    <div className='flex flex-col mb-4'>
                        <label htmlFor="nombre" className='pl-2 font-bold'>Nombre completo</label>
                        <input
                            id="nombre"
                            type="text"
                            name='nombre'
                            placeholder="Tu nombre completo"
                            onChange={handleChange}
                            value={formData.nombre}
                            required
                            className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
                    </div>

                    {/* Email */}
                    <div className='flex flex-col mb-4'>
                        <label htmlFor="email" className='pl-2 font-bold'>Email</label>
                        <input
                            id="email"
                            type="email"
                            name='email'
                            placeholder="email@ejemplo.com"
                            onChange={handleChange}
                            value={formData.email}
                            required
                            className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
                    </div>

                    {/* Teléfono */}
                    <div className='flex flex-col mb-4'>
                        <label htmlFor="telefono" className='pl-2 font-bold'>Teléfono</label>
                        <input
                            id="telefono"
                            type="tel" // Tipo tel para mejor compatibilidad móvil
                            name='telefono'
                            placeholder="Ej: +57 300..."
                            onChange={handleChange}
                            value={formData.telefono}
                            required
                            className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
                    </div>

                    {/* Contraseña */}
                    <div className='flex flex-col mb-6'>
                        <label htmlFor="contrasena" className='pl-2 font-bold'>Contraseña</label>
                        <div className="relative">
                            <input
                                id="contrasena"
                                type={mostrarPassword ? "text" : "password"}
                                name='password'
                                placeholder="Crea una contraseña segura"
                                onChange={handleChange}
                                value={formData.password}
                                required
                                className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
                            <button type="button" onClick={btnMostrarPassword} className="absolute right-3 top-2.5">
                                {mostrarPassword ? <EyeOff size={20} className="text-blue-600 font-bold cursor-pointer" /> : <Eye size={20} className="text-blue-600 font-bold cursor-pointer" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-colors duration-300 cursor-pointer font-bold">
                        Registrarme
                    </button>

                    <div id="ruta-login" className='mt-6 text-center'>
                        <p className='text-gray-700'>
                            ¿Ya tienes una cuenta? <Link to="/login" className='text-blue-500 font-bold hover:underline'>Inicia sesión aquí</Link>
                        </p>
                    </div>

                    <ul className="mt-8 flex justify-center space-x-4">
                        <li className="text-gray-600 text-sm"><a href="#" className="hover:underline">privacy policy</a></li>
                        <li className="text-gray-600 text-sm"><a href="#" className="hover:underline">terms of service</a></li>
                        <li className="text-gray-600 text-sm"><a href="#" className="hover:underline">contact us</a></li>
                    </ul>
                </form>
            </section>
        </div>
    )
}

export default Register