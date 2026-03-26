import { useState, useEffect } from 'react'
import { subscribeToEmployees, createEmployee, updateEmployee, deleteEmployee, generateEmployeeId } from '../firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

function EmployeeManagementPage({ user, onBack }) {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Software Development',
    status: 'Active'
  })

  useEffect(() => {
    console.log('🔍 EmployeeManagementPage: Component mounted')
    try {
      // Subscribe to real-time employees updates
      const unsubscribe = subscribeToEmployees((employeesData) => {
        console.log('📋 Employees loaded:', employeesData)
        setEmployees(employeesData)
      })

      return () => {
        console.log('🔍 EmployeeManagementPage: Component unmounting')
        unsubscribe()
      }
    } catch (err) {
      console.error('❌ Error in useEffect:', err)
      setError(err.message)
    }
  }, [])

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ background: 'var(--light-red)', border: '2px solid var(--primary-red)' }}>
          <h2>Error Loading Employee Management</h2>
          <p>{error}</p>
          <button className="btn-yellow" onClick={onBack}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const handleAddEmployee = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Generate employee ID
      const employeeId = await generateEmployeeId(newEmployee.specialization)
      
      // Create user in Firebase Authentication
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newEmployee.email,
        newEmployee.password
      )
      
      // Create employee in Firestore
      const employeeData = {
        uid: userCredential.user.uid,
        name: newEmployee.name,
        email: newEmployee.email,
        employeeId: employeeId,
        specialization: newEmployee.specialization,
        status: newEmployee.status,
        role: 'employee'
      }
      
      await createEmployee(employeeData)
      
      setNewEmployee({ 
        name: '', 
        email: '', 
        password: '',
        specialization: 'Software Development', 
        status: 'Active' 
      })
      setShowAddForm(false)
      alert(`Employee created successfully! Employee ID: ${employeeId}`)
    } catch (error) {
      console.error('Error adding employee:', error)
      if (error.code === 'auth/email-already-in-use') {
        alert('Email already in use')
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters')
      } else {
        alert('Failed to add employee: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (employeeId, newStatus) => {
    try {
      await updateEmployee(employeeId, { status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update employee status')
    }
  }

  const handleDeleteEmployee = async (employeeId) => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) return
    
    try {
      await deleteEmployee(employeeId)
      setSelectedEmployee(null)
      alert('Employee deleted successfully')
    } catch (error) {
      console.error('Error deleting employee:', error)
      alert('Failed to delete employee')
    }
  }

  const softwareEmployees = employees.filter(emp => emp.specialization === 'Software Development')
  const marketingEmployees = employees.filter(emp => emp.specialization === 'Digital Marketing')
  const bdoEmployees = employees.filter(emp => emp.specialization === 'BDO')
  const activeEmployees = employees.filter(emp => emp.status === 'Active')

  return (
    <div className="container">
      {/* Mobile Menu Overlay */}
      <div 
        className={`mobile-menu-overlay ${mobileMenuOpen ? 'active' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
        </div>
        <div className="mobile-menu-items">
          <button className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); onBack(); }}>Back to Dashboard</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Employee Management</h1>
            <p>Manage all employees and their specializations</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-yellow">Back to Dashboard</button>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Total Employees</h3>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card green">
          <h3>Active Employees</h3>
          <div className="stat-value">{activeEmployees.length}</div>
        </div>
        <div className="stat-card red">
          <h3>Software Team</h3>
          <div className="stat-value">{softwareEmployees.length}</div>
        </div>
        <div className="stat-card yellow">
          <h3>Marketing Team</h3>
          <div className="stat-value">{marketingEmployees.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Employee Management</h2>
          <button className="btn-green" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Employee'}
          </button>
        </div>

        {showAddForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address (e.g., employee@tcg.com)"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <select 
                  value={newEmployee.specialization} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, specialization: e.target.value })}
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="BDO">BDO</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Employee ID will be auto-generated (TT for Software, TD for Marketing, TB for BDO)
                </p>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newEmployee.status} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <button type="submit" className="btn-green" disabled={loading}>
                {loading ? 'Creating...' : 'Add Employee'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Employees ({employees.length})</h2>
        {employees.length === 0 ? (
          <div className="empty-state">
            <p>No employees found. Add your first employee above.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {employees.map(employee => (
              <div 
                key={employee.id} 
                onClick={() => setSelectedEmployee(employee)}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: `4px solid ${
                    employee.specialization === 'Software Development' ? 'var(--primary-red)' : 
                    employee.specialization === 'Digital Marketing' ? 'var(--primary-yellow)' : 
                    'var(--primary-green)'
                  }`
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: employee.specialization === 'Software Development' ? 'var(--primary-red)' : 
                                employee.specialization === 'Digital Marketing' ? 'var(--primary-yellow)' : 
                                'var(--primary-green)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                      {employee.name ? employee.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{employee.name || 'Unknown'}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{employee.employeeId || 'N/A'}</p>
                  </div>
                </div>
                
                <p style={{ margin: '8px 0', fontSize: '13px', color: 'var(--text-secondary)' }}>{employee.email || 'No email'}</p>
                
                <div style={{ marginBottom: '12px' }}>
                  <span className={`status ${
                    employee.specialization === 'Software Development' ? 'in_progress' : 
                    employee.specialization === 'Digital Marketing' ? 'pending' : 
                    'accepted'
                  }`} style={{ fontSize: '12px' }}>
                    {employee.specialization || 'Unknown'}
                  </span>
                  <span className={`status ${employee.status ? employee.status.toLowerCase().replace(' ', '_') : 'inactive'}`} style={{ fontSize: '12px', marginLeft: '8px' }}>
                    {employee.status || 'Unknown'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    className="btn-green" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleUpdateStatus(employee.id, employee.status === 'Active' ? 'Inactive' : 'Active')
                    }}
                  >
                    {employee.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedEmployee && (
        <div className="card" style={{ 
          background: `linear-gradient(135deg, ${
            selectedEmployee.specialization === 'Software Development' ? 'var(--light-red)' : 
            selectedEmployee.specialization === 'Digital Marketing' ? 'var(--light-yellow)' : 
            'var(--light-green)'
          } 0%, var(--bg-secondary) 100%)`, 
          border: `2px solid ${
            selectedEmployee.specialization === 'Software Development' ? 'var(--primary-red)' : 
            selectedEmployee.specialization === 'Digital Marketing' ? 'var(--primary-yellow)' : 
            'var(--primary-green)'
          }`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2>Employee Details: {selectedEmployee.name || 'Unknown'}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-red" onClick={() => handleDeleteEmployee(selectedEmployee.id)}>Delete</button>
              <button className="btn-yellow" onClick={() => setSelectedEmployee(null)}>Close</button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedEmployee.name || 'N/A'}</p>
                <p><strong>Email:</strong> {selectedEmployee.email || 'N/A'}</p>
                <p><strong>Employee ID:</strong> {selectedEmployee.employeeId || 'N/A'}</p>
              </div>
              <div>
                <h4>Work Details</h4>
                <p><strong>Specialization:</strong> {selectedEmployee.specialization || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedEmployee.status || 'N/A'}</p>
                <p><strong>Department:</strong> {
                  selectedEmployee.specialization === 'Software Development' ? 'Technology' : 
                  selectedEmployee.specialization === 'Digital Marketing' ? 'Marketing' : 
                  selectedEmployee.specialization === 'BDO' ? 'Business Development' : 'N/A'
                }</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagementPage
