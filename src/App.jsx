import { useState, useEffect } from 'react'
import Login from './pages/Login'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import BDODashboard from './pages/BDODashboard'
import SoftwareDeveloperDashboard from './pages/SoftwareDeveloperDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  if (user.role === 'client') {
    return <ClientDashboard user={user} onLogout={handleLogout} />
  }
  
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }
  
  if (user.role === 'employee') {
    return <EmployeeDashboard user={user} onLogout={handleLogout} />
  }
  
  if (user.role === 'bdo') {
    return <BDODashboard user={user} onLogout={handleLogout} />
  }
  
  if (user.role === 'developer') {
    return <SoftwareDeveloperDashboard user={user} onLogout={handleLogout} />
  }
  
  if (user.role === 'superadmin') {
    return <SuperAdminDashboard user={user} onLogout={handleLogout} />
  }

  return <Login onLogin={handleLogin} />
}

export default App
