import { useState, useEffect } from 'react'

const mockAdmins = [
  { id: 1, name: 'Admin User', email: 'admin@test.com', role: 'Admin', status: 'Active', department: 'Operations' },
  { id: 2, name: 'Sarah Admin', email: 'sarah.admin@test.com', role: 'Admin', status: 'Active', department: 'HR' },
  { id: 3, name: 'Mike Manager', email: 'mike.manager@test.com', role: 'Manager', status: 'Active', department: 'Technology' }
]

function AdminManagementPage({ user, onBack }) {
  const [admins, setAdmins] = useState(mockAdmins)
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'Admin',
    status: 'Active',
    department: 'Operations'
  })

  useEffect(() => {
    loadProjects()
    loadEmployees()
  }, [])

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('softwareProjects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }

  const loadEmployees = () => {
    // Mock software employees for project assignment
    const softwareEmployees = [
      { id: 1, name: 'John Employee', email: 'employee@test.com', specialization: 'Software' },
      { id: 2, name: 'Bob Staff', email: 'bob@test.com', specialization: 'Software' }
    ]
    setEmployees(softwareEmployees)
  }

  const handleAddAdmin = (e) => {
    e.preventDefault()
    const admin = {
      id: Date.now(),
      ...newAdmin
    }
    setAdmins([...admins, admin])
    setNewAdmin({ name: '', email: '', role: 'Admin', status: 'Active', department: 'Operations' })
    setShowAddForm(false)
  }

  const handleUpdateStatus = (adminId, newStatus) => {
    setAdmins(admins.map(admin => 
      admin.id === adminId ? { ...admin, status: newStatus } : admin
    ))
  }

  const handleAssignProject = (projectId, employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return

    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = allProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          assignedTo: employee.name,
          assignedBy: user.name,
          assignedAt: new Date().toISOString(),
          statusHistory: [...(p.statusHistory || []), {
            status: 'Assigned to Employee',
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'superadmin'
          }]
        }
      }
      return p
    })
    localStorage.setItem('softwareProjects', JSON.stringify(updatedProjects))
    loadProjects()
  }

  const activeAdmins = admins.filter(admin => admin.status === 'Active')
  const availableProjects = projects.filter(p => !p.assignedTo && p.status === 'Available')

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
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>×</button>
        </div>
        <div className="mobile-menu-items">
          <button className="mobile-menu-item" onClick={onBack}>Back to Dashboard</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Admin Management</h1>
            <p>Manage administrators and project assignments</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-yellow">Back to Dashboard</button>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Total Admins</h3>
          <div className="stat-value">{admins.length}</div>
        </div>
        <div className="stat-card green">
          <h3>Active Admins</h3>
          <div className="stat-value">{activeAdmins.length}</div>
        </div>
        <div className="stat-card yellow">
          <h3>Available Projects</h3>
          <div className="stat-value">{availableProjects.length}</div>
        </div>
        <div className="stat-card red">
          <h3>Software Employees</h3>
          <div className="stat-value">{employees.length}</div>
        </div>
      </div>

      {availableProjects.length > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-green)' }}>
          <h2>Project Assignment Center</h2>
          <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
            Assign available software projects to software development employees
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {availableProjects.map(project => (
              <div key={project.id} style={{
                background: 'var(--bg-secondary)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                borderLeft: '4px solid var(--primary-green)'
              }}>
                <h4 style={{ marginBottom: '12px' }}>{project.projectName}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Client:</strong> {project.clientName}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Technology:</strong> {project.technology}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  <strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}
                </p>
                
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select 
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    onChange={(e) => handleAssignProject(project.id, parseInt(e.target.value))}
                    defaultValue=""
                  >
                    <option value="">Assign to Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Admin Management</h2>
          <button className="btn-green" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Admin'}
          </button>
        </div>

        {showAddForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Administrator</h3>
            <form onSubmit={handleAddAdmin}>
              <div className="form-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  placeholder="Enter admin name"
                  value={newAdmin.name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select 
                  value={newAdmin.role} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                </select>
              </div>
              <div className="form-group">
                <label>Department</label>
                <select 
                  value={newAdmin.department} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })}
                >
                  <option value="Operations">Operations</option>
                  <option value="HR">Human Resources</option>
                  <option value="Technology">Technology</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newAdmin.status} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <button type="submit" className="btn-green">Add Administrator</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Administrators ({admins.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {admins.map(admin => (
            <div 
              key={admin.id} 
              onClick={() => setSelectedAdmin(admin)}
              style={{
                background: 'var(--bg-primary)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: '4px solid var(--primary-red)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: 'var(--primary-red)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                    {admin.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{admin.name}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{admin.email}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <span className="status in_progress" style={{ fontSize: '12px' }}>
                  {admin.role}
                </span>
                <span className={`status ${admin.status.toLowerCase()}`} style={{ fontSize: '12px', marginLeft: '8px' }}>
                  {admin.status}
                </span>
              </div>
              
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                <strong>Department:</strong> {admin.department}
              </p>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button 
                  className="btn-green" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus(admin.id, admin.status === 'Active' ? 'Inactive' : 'Active')
                  }}
                >
                  {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedAdmin && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Administrator Details: {selectedAdmin.name}</h2>
            <button className="btn-red" onClick={() => setSelectedAdmin(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedAdmin.name}</p>
                <p><strong>Email:</strong> {selectedAdmin.email}</p>
                <p><strong>Admin ID:</strong> ADM-{selectedAdmin.id}</p>
              </div>
              <div>
                <h4>Administrative Details</h4>
                <p><strong>Role:</strong> {selectedAdmin.role}</p>
                <p><strong>Department:</strong> {selectedAdmin.department}</p>
                <p><strong>Status:</strong> {selectedAdmin.status}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminManagementPage