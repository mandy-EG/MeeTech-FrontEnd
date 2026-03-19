import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import axios from 'axios'
import { Toaster } from 'sonner'
import Login from './components/login/Login.jsx'
import SingUp from './components/signUp/SignUp.jsx'
import Home from './components/dasboard/Home.jsx'
import GoogleCallback from './components/auth/GoogleCallback.jsx'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

const persistedToken = localStorage.getItem('authToken');
if (persistedToken) {
  axios.defaults.headers.common.Authorization = `Bearer ${persistedToken}`;
}

function App() {

  return (
    <>
      <Router>

        <Toaster richColors position="top-center" />

        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<SingUp />} />
          <Route path='/auth/callback' element={<GoogleCallback />} />
          <Route path='/home' element={<Home />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
