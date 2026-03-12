import { useState } from 'react'

const mockUsers = [
  { email: 'client@test.com', password: 'password', name: 'Client User', role: 'client' },
  { email: 'admin@test.com', password: 'password', name: 'Admin User', role: 'admin' },
  { email: 'employee@test.com', password: 'password', name: 'Employee User', role: 'employee' },
  { email: 'bdo@test.com', password: 'password', name: 'BDO User', role: 'bdo' },
  { email: 'superadmin@test.com', password: 'password', name: 'Super Admin', role: 'superadmin' }
]

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    const user = mockUsers.find(u => u.email === email && u.password === password)
    
    if (user) {
      onLogin({ name: user.name, role: user.role, email: user.email })
    } else {
      setError('Invalid credentials')
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
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter your email"
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
          <button type="submit" className="btn-green" style={{ width: '100%' }}>
            Sign In
          </button>
        </form>
        
        <div className="test-accounts">
          <strong>Test Accounts</strong>
          <p><strong>Client:</strong> client@test.com / password</p>
          <p><strong>Admin:</strong> admin@test.com / password</p>
          <p><strong>Employee:</strong> employee@test.com / password</p>
          <p><strong>BDO:</strong> bdo@test.com / password</p>
          <p><strong>Super Admin:</strong> superadmin@test.com / password</p>
        </div>
      </div>
    </div>
  )
}

export default Login
