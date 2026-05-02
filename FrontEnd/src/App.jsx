import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import './config/axiosConfig.js'
import Login from './components/login/Login.jsx'
import SingUp from './components/signUp/SignUp.jsx'
import Home from './components/dasboard/Home.jsx'
import GoogleCallback from './components/auth/GoogleCallback.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import AdminDashboard from './components/admin/AdminDashboard.jsx'
import AdminLayout from './components/admin/AdminLayout.jsx'
import TableManagement from './components/admin/TableManagement.jsx'
import CocinaPanel from './components/cocina/CocinaPanel.jsx'
import CajaPanel from './components/caja/CajaPanel.jsx'
import TurnoGuard from './components/admin/TurnoGuard.jsx'

function App() {
  return (
    <>
      <Router>
        <Toaster richColors position="top-center" />
        <Routes>
          {/* Rutas públicas */}
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<SingUp />} />
          <Route path='/auth/callback' element={<GoogleCallback />} />
          <Route path='/home' element={<Home />} />

          {/* Panel Admin — auto-contenido con sidebar propio */}
          <Route path='/admin' element={
            <ProtectedRoute><AdminDashboard /></ProtectedRoute>
          } />

          {/* Vista de Mesas — Mesero */}
          <Route path='/mesas' element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<TurnoGuard><TableManagement /></TurnoGuard>} />
          </Route>

          {/* Panel de Cocina */}
          <Route path='/cocina' element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<TurnoGuard><CocinaPanel /></TurnoGuard>} />
          </Route>

          {/* Panel de Caja / Facturación */}
          <Route path='/facturacion' element={
            <ProtectedRoute><AdminLayout /></ProtectedRoute>
          }>
            <Route index element={<TurnoGuard><CajaPanel /></TurnoGuard>} />
          </Route>

          {/* Rutas no encontradas */}
          <Route path='*' element={<Navigate to='/login' replace />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
