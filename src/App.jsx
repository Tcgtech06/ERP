import { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase/config'
import { logoutUser } from './firebase/auth'
import Login from './pages/Login'
import ClientDashboard from './pages/ClientDashboard'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import SuperAdminDashboard from './pages/SuperAdminDashboard'
import BDODashboard from './pages/BDODashboard'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = JSON.parse(localStorage.getItem('userData') || '{}')
        setUser(userData)
      } else {
        // User is signed out
        setUser(null)
        localStorage.removeItem('userData')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData))
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await logoutUser()
      setUser(null)
      localStorage.removeItem('userData')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  switch (user.role) {
    case 'client':
      return <ClientDashboard user={user} onLogout={handleLogout} />
    case 'admin':
      return <AdminDashboard user={user} onLogout={handleLogout} />
    case 'employee':
      // Check specialization for BDO
      if (user.specialization === 'BDO') {
        return <BDODashboard user={user} onLogout={handleLogout} />
      }
      return <EmployeeDashboard user={user} onLogout={handleLogout} />
    case 'superadmin':
      return <SuperAdminDashboard user={user} onLogout={handleLogout} />
    default:
      return <Login onLogin={handleLogin} />
  }
}

export default App
