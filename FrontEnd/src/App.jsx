import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import { toast, Toaster } from 'sonner'
import Login from './components/login/Login.jsx'
import SingUp from './components/signUp/SignUp.jsx'
import Home from './components/dasboard/Home.jsx'

function App() {

  axios.defaults.baseURL = 'http://localhost:3000/api'

  return (
    <>
      <Router>

        <Toaster richColors position="top-center" />

        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<SingUp />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
