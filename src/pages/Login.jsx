import { useState } from 'react'
import { loginUser } from '../firebase/auth'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const userData = await loginUser(email, password)
      onLogin(userData)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleSpecializationSubmit = () => {
    if (pendingUser) {
      onLogin({ 
        name: pendingUser.name, 
        role: pendingUser.role, 
        email: pendingUser.email,
        specialization: specialization
      })
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <h1>Task Management System</h1>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email or Employee ID</label>
            <input
              type="text"
              placeholder="Enter your email or employee ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '✕' : '◉'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-green" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="test-accounts">
          <strong>Login Credentials</strong>
          <p><strong>Super Admin:</strong> superadmin@tcg.com / tcgtech@01</p>
          <p><strong>Admin:</strong> TCGadmin01 / admin@01</p>
          <p><strong>Client:</strong> client@tcg.com / client@123</p>
          <p><strong>Employee:</strong> TT001 / TCGT202601 (Software)</p>
          <p><strong>Employee:</strong> TD001 / TCGD202601 (Digital Marketing)</p>
          <p><strong>Employee:</strong> TB001 / TCGB202601 (BDO)</p>
        </div>
      </div>
    </div>
  )
}

export default Login
