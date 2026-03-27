import { useState, useEffect } from 'react'
import { subscribeToAdmins, createAdmin, updateAdmin, deleteAdmin, generateAdminId, subscribeToEmployees, subscribeToSoftwareProjects } from '../firebase/firestore'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

function AdminManagementPage({ user, onBack }) {
  const [admins, setAdmins] = useState([])
  const [selectedAdmin, setSelectedAdmin] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState(null)
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    password: '',
    department: 'Software Development',
    status: 'Active'
  })

  useEffect(() => {
    console.log('🔍 AdminManagementPage: Component mounted')
    try {
      // Subscribe to real-time admins updates
      const unsubscribeAdmins = subscribeToAdmins((adminsData) => {
        console.log('📋 Admins loaded:', adminsData)
        // Filter out deleted admins
        const activeAdmins = adminsData.filter(admin => admin.status !== 'Deleted')
        setAdmins(activeAdmins)
      })

      // Subscribe to employees for project assignment
      const unsubscribeEmployees = subscribeToEmployees((employeesData) => {
        console.log('📋 Employees loaded:', employeesData)
        setEmployees(employeesData.filter(emp => emp.status === 'Active'))
      })

      // Subscribe to software projects
      const unsubscribeProjects = subscribeToSoftwareProjects((projectsData) => {
        console.log('📋 Projects loaded:', projectsData)
        setProjects(projectsData)
      })

      return () => {
        console.log('🔍 AdminManagementPage: Component unmounting')
        unsubscribeAdmins()
        unsubscribeEmployees()
        unsubscribeProjects()
      }
    } catch (err) {
      console.error('❌ Error in useEffect:', err)
      setError(err.message)
    }
  }, [])

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Generate admin ID
      const adminId = await generateAdminId()
      
      // Auto-generate email from admin ID
      const email = `${adminId.toLowerCase()}@tcg.com`
      
      console.log('📝 Creating admin:', { name: newAdmin.name, adminId, email })
      
      // Create user in Firebase Authentication
      const auth = getAuth()
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        newAdmin.password
      )
      
      // Create admin in Firestore
      const adminData = {
        uid: userCredential.user.uid,
        name: newAdmin.name,
        email: email,
        adminId: adminId,
        department: newAdmin.department,
        status: newAdmin.status,
        role: 'admin'
      }
      
      await createAdmin(adminData)
      
      setNewAdmin({ 
        name: '', 
        password: '',
        department: 'Software Development', 
        status: 'Active' 
      })
      setShowAddForm(false)
      alert(`Admin created successfully!\n\nAdmin ID: ${adminId}\nPassword: ${newAdmin.password}\n\nAdmin can login using Admin ID and password.`)
    } catch (error) {
      console.error('Error adding admin:', error)
      if (error.code === 'auth/email-already-in-use') {
        alert('This admin ID is already in use')
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters')
      } else {
        alert('Failed to add admin: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (adminId, newStatus) => {
    try {
      await updateAdmin(adminId, { status: newStatus })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update admin status')
    }
  }

  const handleEditAdmin = (admin) => {
    setEditingAdmin({
      id: admin.id,
      name: admin.name,
      department: admin.department,
      status: admin.status,
      adminId: admin.adminId
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handleUpdateAdmin = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateAdmin(editingAdmin.id, {
        name: editingAdmin.name,
        department: editingAdmin.department,
        status: editingAdmin.status
      })
      
      setEditingAdmin(null)
      setShowEditForm(false)
      alert('Admin updated successfully!')
    } catch (error) {
      console.error('Error updating admin:', error)
      alert('Failed to update admin: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingAdmin(null)
    setShowEditForm(false)
  }

  const handleDeleteAdmin = async (adminId) => {
    if (!confirm('Are you sure you want to delete this admin? This action cannot be undone.')) return
    
    try {
      await updateAdmin(adminId, { 
        status: 'Deleted',
        deletedAt: new Date().toISOString()
      })
      
      await deleteAdmin(adminId)
      setSelectedAdmin(null)
      alert('Admin deleted successfully from system.\n\nNote: The Firebase Auth account still exists. To fully remove, delete from Firebase Console → Authentication.')
    } catch (error) {
      console.error('Error deleting admin:', error)
      alert('Failed to delete admin: ' + error.message)
    }
  }

  const handleAssignProject = async (projectId, employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId)
    if (!employee) return

    try {
      const { updateSoftwareProject } = await import('../firebase/firestore')
      await updateSoftwareProject(projectId, {
        assignedTo: employee.name,
        assignedBy: user.name,
        assignedAt: new Date().toISOString(),
        statusHistory: [...(projects.find(p => p.id === projectId)?.statusHistory || []), {
          status: 'Assigned to Employee',
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'superadmin'
        }]
      })
      alert(`Project assigned to ${employee.name} successfully!`)
    } catch (error) {
      console.error('Error assigning project:', error)
      alert('Failed to assign project')
    }
  }

  if (error) {
    return (
      <div className="container">
        <div className="card" style={{ background: 'var(--light-red)', border: '2px solid var(--primary-red)' }}>
          <h2>Error Loading Admin Management</h2>
          <p>{error}</p>
          <button className="btn-yellow" onClick={onBack}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const softwareAdmins = admins.filter(admin => admin.department === 'Software Development')
  const marketingAdmins = admins.filter(admin => admin.department === 'Digital Marketing')
  const bdoAdmins = admins.filter(admin => admin.department === 'BDO')
  const activeAdmins = admins.filter(admin => admin.status === 'Active')
  const availableProjects = projects.filter(p => !p.assignedTo && p.status === 'Available')
  const softwareEmployees = employees.filter(emp => emp.specialization === 'Software Development')

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
            <h1>Admin Management</h1>
            <p>Manage administrators and project assignments</p>
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
          <h3>Total Admins</h3>
          <div className="stat-value">{admins.length}</div>
        </div>
        <div className="stat-card green">
          <h3>Active Admins</h3>
          <div className="stat-value">{activeAdmins.length}</div>
        </div>
        <div className="stat-card red">
          <h3>Software Dept</h3>
          <div className="stat-value">{softwareAdmins.length}</div>
        </div>
        <div className="stat-card yellow">
          <h3>Marketing Dept</h3>
          <div className="stat-value">{marketingAdmins.length}</div>
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
                    onChange={(e) => handleAssignProject(project.id, e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Assign to Employee</option>
                    {softwareEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Admin Management</h2>
          <button className="btn-green" onClick={() => { setShowAddForm(!showAddForm); setShowEditForm(false); }}>
            {showAddForm ? 'Cancel' : 'Add New Admin'}
          </button>
        </div>

        {showEditForm && editingAdmin && (
          <div style={{ background: 'var(--light-yellow)', padding: '24px', borderRadius: '12px', marginBottom: '20px', border: '2px solid var(--primary-yellow)' }}>
            <h3 style={{ marginBottom: '20px' }}>Edit Admin: {editingAdmin.adminId}</h3>
            <form onSubmit={handleUpdateAdmin}>
              <div className="form-group">
                <label>Admin Name</label>
                <input
                  type="text"
                  placeholder="Enter admin name"
                  value={editingAdmin.name}
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select 
                  value={editingAdmin.department} 
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, department: e.target.value })}
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="BDO">BDO</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Note: Admin ID cannot be changed
                </p>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={editingAdmin.status} 
                  onChange={(e) => setEditingAdmin({ ...editingAdmin, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-green" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Admin'}
                </button>
                <button type="button" className="btn-red" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

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
                <label>Department</label>
                <select 
                  value={newAdmin.department} 
                  onChange={(e) => setNewAdmin({ ...newAdmin, department: e.target.value })}
                >
                  <option value="Software Development">Software Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                  <option value="BDO">BDO</option>
                </select>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Admin ID will be auto-generated (TCGadmin01, TCGadmin02, etc.)
                </p>
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Enter password (min 6 characters)"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  required
                  minLength={6}
                />
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Admin will use Admin ID and this password to login
                </p>
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
              <button type="submit" className="btn-green" disabled={loading}>
                {loading ? 'Creating...' : 'Add Administrator'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Administrators ({admins.length})</h2>
        {admins.length === 0 ? (
          <div className="empty-state">
            <p>No admins found. Add your first admin above.</p>
          </div>
        ) : (
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
                  borderLeft: `4px solid ${
                    admin.department === 'Software Development' ? 'var(--primary-red)' : 
                    admin.department === 'Digital Marketing' ? 'var(--primary-yellow)' : 
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
                    background: admin.department === 'Software Development' ? 'var(--primary-red)' : 
                                admin.department === 'Digital Marketing' ? 'var(--primary-yellow)' : 
                                'var(--primary-green)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                      {admin.name ? admin.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{admin.name || 'Unknown'}</h3>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold', color: 'var(--primary-green)' }}>{admin.adminId || 'N/A'}</p>
                  </div>
                </div>
                
                <p style={{ margin: '8px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Department: {admin.department || 'Unknown'}</p>
                
                <div style={{ marginBottom: '12px' }}>
                  <span className={`status ${
                    admin.department === 'Software Development' ? 'in_progress' : 
                    admin.department === 'Digital Marketing' ? 'pending' : 
                    'accepted'
                  }`} style={{ fontSize: '12px' }}>
                    {admin.department || 'Unknown'}
                  </span>
                  <span className={`status ${admin.status ? admin.status.toLowerCase().replace(' ', '_') : 'inactive'}`} style={{ fontSize: '12px', marginLeft: '8px' }}>
                    {admin.status || 'Unknown'}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button 
                    className="btn-yellow" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditAdmin(admin)
                    }}
                  >
                    Edit
                  </button>
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
        )}
      </div>

      {selectedAdmin && (
        <div className="card" style={{ 
          background: `linear-gradient(135deg, ${
            selectedAdmin.department === 'Software Development' ? 'var(--light-red)' : 
            selectedAdmin.department === 'Digital Marketing' ? 'var(--light-yellow)' : 
            'var(--light-green)'
          } 0%, var(--bg-secondary) 100%)`, 
          border: `2px solid ${
            selectedAdmin.department === 'Software Development' ? 'var(--primary-red)' : 
            selectedAdmin.department === 'Digital Marketing' ? 'var(--primary-yellow)' : 
            'var(--primary-green)'
          }`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <h2>Administrator Details: {selectedAdmin.name || 'Unknown'}</h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className="btn-red" onClick={() => handleDeleteAdmin(selectedAdmin.id)}>Delete</button>
              <button className="btn-yellow" onClick={() => setSelectedAdmin(null)}>Close</button>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedAdmin.name || 'N/A'}</p>
                <p><strong>Admin ID:</strong> <span style={{ color: 'var(--primary-green)', fontWeight: 'bold', fontSize: '16px' }}>{selectedAdmin.adminId || 'N/A'}</span></p>
                <p><strong>Email:</strong> {selectedAdmin.email || 'N/A'}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  💡 Login: Use Admin ID + Password
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>
                  Note: Password cannot be retrieved. To reset, delete and recreate admin.
                </p>
              </div>
              <div>
                <h4>Administrative Details</h4>
                <p><strong>Department:</strong> {selectedAdmin.department || 'N/A'}</p>
                <p><strong>Status:</strong> {selectedAdmin.status || 'N/A'}</p>
                <p><strong>Role:</strong> Admin</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminManagementPage