import { React, useState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')

  const btnMostrarPassword = () => {
    setMostrarPassword(!mostrarPassword)
  }

  return (
    <div className="h-screen bg-gray-900 flex items-center justify-center">
      <section className="h-screen w-full">
        <img src="/src/assets/fondoRestaurante.png" alt="Fondo Restaurante" className="object-cover w-full h-full opacity-30" />
        <div id="textos-img" className='w-1/3 flex flex-col absolute bottom-50 left-20 p-4 gap-2'>
          <h1 className="text-4xl text-yellow-600 font-bold">Lleva tu restaurante al siguiente nivel</h1>
          <span className="text-gray-300">Meetech es un software de gestión para restaurantes, siente la diferencia con nuestra solución integral.</span>
        </div>
      </section>

      <section className="bg-gray-200 w-2/3 h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-6">Bienvenido a MeeTech</h1>

        <h3 className="text-gray-700 mb-4">Ingresa tus datos para continuar</h3>

        <form id="container-inputs" className='flex flex-col w-2/3'>

          <div id="usuario-container" className='flex flex-col mb-4'>
            <label htmlFor="usuario" className='pl-2 font-bold'>Usuario</label>
            <input id="usuario" type="text" placeholder="Ingrese su usuario" className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
          </div>

          <div id="password-container" className='flex flex-col mb-4'>

            <div id="textos" className='flex justify-between items-center'>
              <label htmlFor="contrasena" className='pl-2 font-bold'>Contraseña</label>
              <a href="#" className='text-blue-500 hover:underline'>¿Olvidaste tu contraseña?</a>
            </div>

            <div className="relative">
              <input id="contrasena" type={mostrarPassword ? "text" : "password"} placeholder="Ingrese su contraseña" className="w-full p-2 rounded-xl border-2 border-blue-200 outline-none transition-all duration-300 focus:border-gray-500 ring-2 ring-gray-100/50" />
              <button type="button" onClick={btnMostrarPassword} className="absolute right-3 top-2.5">
                {mostrarPassword ? <EyeOff size={20} className="text-blue-600 font-bold cursor-pointer" /> : <Eye size={20} className="text-blue-600 font-bold cursor-pointer" />}
              </button>
            </div>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition-colors duration-300 cursor-pointer">Iniciar Sesión</button>

          <div id="ruta-registro" className='mt-8 text-center'>
            <p className='text-gray-700'>¿No tienes cuenta? <a href="#" className='text-blue-500 hover:underline'>Regístrate aquí</a></p>
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

export default Login
