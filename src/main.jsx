import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import App from './App'
import './index.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) return <div>جاري التحميل...</div>
  
  return user ? children : <Navigate to="/login" />
}

import { useAuth } from './context/AuthContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/" element={<App />} />
        </Routes>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
