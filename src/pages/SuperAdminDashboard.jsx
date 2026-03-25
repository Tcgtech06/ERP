import { useState, useEffect } from 'react'
import { subscribeToTasks, createTask, updateTask, deleteTask, getUsers, getEmployees } from '../firebase/firestore'
import BDOReportsPage from './BDOReportsPage'
import SoftwareProjectsPage from './SoftwareProjectsPage'
import ClientManagementPage from './ClientManagementPage'
import EmployeeManagementPage from './EmployeeManagementPage'
import AdminManagementPage from './AdminManagementPage'
import FinancePage from './FinancePage'

const mockEmployees = [
  { id: 1, name: 'Software Employee', email: 'TT001', employeeId: 'TT001', specialization: 'Software' },
  { id: 2, name: 'Digital Marketing Employee', email: 'TD001', employeeId: 'TD001', specialization: 'Digital Marketing' },
  { id: 3, name: 'BDO Employee', email: 'TB001', employeeId: 'TB001', specialization: 'BDO' }
]

const mockClients = [
  { id: 1, name: 'Client User', email: 'client@test.com' },
  { id: 2, name: 'Alice Client', email: 'alice@test.com' },
  { id: 3, name: 'Bob Client', email: 'bob.client@test.com' }
]

function SuperAdminDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [bdoClients, setBdoClients] = useState([])
  const [softwareProjects, setSoftwareProjects] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({})
  const [selectedBdoClient, setSelectedBdoClient] = useState(null)
  const [selectedSoftwareProject, setSelectedSoftwareProject] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showNoteForm, setShowNoteForm] = useState({})
  const [currentView, setCurrentView] = useState('dashboard')
  const [clients, setClients] = useState([])
  const [employees, setEmployees] = useState(mockEmployees)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Subscribe to real-time tasks updates
    const unsubscribe = subscribeToTasks(user.uid, user.role, (tasksData) => {
      setTasks(tasksData)
    })

    // Load users and employees from Firebase
    loadUsersAndEmployees()
    loadBdoClients()
    loadSoftwareProjects()

    return () => unsubscribe()
  }, [user.uid, user.role])

  const loadUsersAndEmployees = async () => {
    try {
      console.log('📥 SuperAdmin: Loading users and employees...');
      const [usersData, employeesData] = await Promise.all([
        getUsers(),
        getEmployees()
      ])
      
      console.log('Users data:', usersData);
      console.log('Employees data from Firebase:', employeesData);
      
      if (usersData.length > 0) {
        const clientUsers = usersData.filter(u => u.role === 'client')
        if (clientUsers.length > 0) {
          setClients(clientUsers)
          console.log('✅ Clients set:', clientUsers.length);
        }
      }
      
      // ALWAYS use mockEmployees to ensure all 3 types are available
      // Firebase data will be merged if available
      if (employeesData.length > 0) {
        console.log('✅ Using Firebase employees:', employeesData.length);
        // Merge Firebase data with mock data, prioritizing Firebase
        const mergedEmployees = [...mockEmployees];
        employeesData.forEach(fbEmp => {
          const existingIndex = mergedEmployees.findIndex(m => m.employeeId === fbEmp.employeeId);
          if (existingIndex >= 0) {
            mergedEmployees[existingIndex] = fbEmp;
          } else {
            mergedEmployees.push(fbEmp);
          }
        });
        setEmployees(mergedEmployees);
        console.log('✅ Merged employees:', mergedEmployees);
      } else {
        console.log('⚠️ No Firebase employees, using mock data');
        setEmployees(mockEmployees);
      }
    } catch (error) {
      console.error('❌ Error loading users:', error)
      console.log('Using mock employees as fallback');
      setEmployees(mockEmployees)
    }
  }

  const loadBdoClients = () => {
    const savedClients = localStorage.getItem('bdoClients')
    if (savedClients) {
      setBdoClients(JSON.parse(savedClients))
    }
  }

  const loadSoftwareProjects = () => {
    const savedProjects = localStorage.getItem('softwareProjects')
    if (savedProjects) {
      setSoftwareProjects(JSON.parse(savedProjects))
    }
  }

  const handleSendNote = (clientId) => {
    if (!noteText.trim()) return

    const savedClients = localStorage.getItem('bdoClients')
    const allClients = savedClients ? JSON.parse(savedClients) : []
    const updatedClients = allClients.map(c => {
      if (c.id === clientId) {
        const notes = c.notes || []
        return {
          ...c,
          notes: [...notes, {
            id: Date.now(),
            text: noteText,
            sentBy: user.name,
            sentAt: new Date().toISOString(),
            seen: false
          }]
        }
      }
      return c
    })
    localStorage.setItem('bdoClients', JSON.stringify(updatedClients))
    loadBdoClients()
    setNoteText('')
    setShowNoteForm({ ...showNoteForm, [clientId]: false })
  }

  const handleSendProjectNote = (projectId) => {
    if (!noteText.trim()) return

    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = allProjects.map(p => {
      if (p.id === projectId) {
        const notes = p.notes || []
        return {
          ...p,
          notes: [...notes, {
            id: Date.now(),
            text: noteText,
            sentBy: user.name,
            sentAt: new Date().toISOString(),
            seen: false
          }]
        }
      }
      return p
    })
    localStorage.setItem('softwareProjects', JSON.stringify(updatedProjects))
    loadSoftwareProjects()
    setNoteText('')
    setShowNoteForm({ ...showNoteForm, [`project_${projectId}`]: false })
  }

  const handleMarkNoteSeen = (clientId, noteId) => {
    const savedClients = localStorage.getItem('bdoClients')
    const allClients = savedClients ? JSON.parse(savedClients) : []
    const updatedClients = allClients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          notes: c.notes.map(n => n.id === noteId ? { ...n, seen: true } : n)
        }
      }
      return c
    })
    localStorage.setItem('bdoClients', JSON.stringify(updatedClients))
    loadBdoClients()
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!selectedEmployee) {
      alert('Please select an assignee')
      return
    }
    
    const client = selectedClient ? clients.find(c => c.email === selectedClient) : null
    const employee = employees.find(emp => emp.name === selectedEmployee)
    
    const newTask = {
      title,
      description,
      priority,
      status: 'accepted',
      clientId: client?.uid || client?.id || null,
      clientEmail: client?.email || null,
      clientName: client?.name || 'No specific client',
      assignedTo: employee ? (employee.uid || employee.id) : selectedEmployee, // Can be Admin or Super Admin
      assignedToName: selectedEmployee,
      assignedBy: user.name,
      createdBy: user.name,
      statusHistory: [
        {
          status: 'accepted',
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'superadmin'
        }
      ]
    }

    try {
      await createTask(newTask)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setSelectedClient('')
      setSelectedEmployee('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Failed to delete task')
    }
  }

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (!newStatus) return

    try {
      await updateTask(taskId, {
        status: newStatus,
        statusHistory: [
          {
            status: newStatus,
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'superadmin'
          }
        ]
      })
      
      setStatusUpdate({ ...statusUpdate, [taskId]: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update task status')
    }
  }

  const handleClearAll = async () => {
    if (!confirm('Clear all tasks? This action cannot be undone.')) return
    
    try {
      // Delete all tasks one by one
      for (const task of tasks) {
        await deleteTask(task.id)
      }
    } catch (error) {
      console.error('Error clearing tasks:', error)
      alert('Failed to clear all tasks')
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const currentTasks = tasks.filter(t => t.status === 'pending' || t.status === 'accepted' || t.status === 'in_progress')
  const cancelledTasks = tasks.filter(t => t.status === 'rejected')

  const statusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: completedTasks.length,
    total: tasks.length
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = days[date.getDay()]
    const dateStr = date.toLocaleDateString()
    const timeStr = date.toLocaleTimeString()
    return { day, date: dateStr, time: timeStr }
  }

  return (
    <>
      {currentView === 'bdo-reports' && (
        <BDOReportsPage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'software-projects' && (
        <SoftwareProjectsPage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'client-management' && (
        <ClientManagementPage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'employee-management' && (
        <EmployeeManagementPage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'admin-management' && (
        <AdminManagementPage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'finance' && (
        <FinancePage user={user} onBack={() => setCurrentView('dashboard')} />
      )}
      
      {currentView === 'dashboard' && (
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
          <button className="mobile-menu-item" onClick={() => { setCurrentView('client-management'); setMobileMenuOpen(false); }}>Client Management</button>
          <button className="mobile-menu-item" onClick={() => { setCurrentView('employee-management'); setMobileMenuOpen(false); }}>Employee Management</button>
          <button className="mobile-menu-item" onClick={() => { setCurrentView('admin-management'); setMobileMenuOpen(false); }}>Admin Management</button>
          <button className="mobile-menu-item" onClick={() => { setCurrentView('bdo-reports'); setMobileMenuOpen(false); }}>BDO Reports</button>
          <button className="mobile-menu-item" onClick={() => { setCurrentView('software-projects'); setMobileMenuOpen(false); }}>Software Projects</button>
          <button className="mobile-menu-item" onClick={() => { setCurrentView('finance'); setMobileMenuOpen(false); }}>Finance Management</button>
          <button className="mobile-menu-item" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Super Admin Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="btn-red">Logout</button>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <h3>Pending</h3>
          <div className="stat-value">{statusCounts.pending}</div>
        </div>
        <div className="stat-card red">
          <h3>In Progress</h3>
          <div className="stat-value">{statusCounts.in_progress}</div>
        </div>
        <div className="stat-card green">
          <h3>Completed</h3>
          <div className="stat-value">{statusCounts.completed}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Total Tasks</h3>
          <div className="stat-value">{statusCounts.total}</div>
        </div>
      </div>

      <div className="card">
        <h2>Management Modules</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
          <div 
            onClick={() => setCurrentView('client-management')}
            style={{
              background: 'linear-gradient(135deg, var(--light-green) 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid var(--primary-green)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon client-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-green)' }}>Client Management</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Manage client accounts, projects, and communications
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('employee-management')}
            style={{
              background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid var(--primary-red)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon employee-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-red)" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-red)' }}>Employee Management</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Manage employees, specializations, and assignments
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('admin-management')}
            style={{
              background: 'linear-gradient(135deg, var(--light-yellow) 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid var(--primary-yellow)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon admin-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-yellow)" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-yellow)' }}>Admin Management</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Manage administrators and project assignments
            </p>
          </div>

          <div 
            onClick={() => setCurrentView('bdo-reports')}
            style={{
              background: 'linear-gradient(135deg, var(--light-green) 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid var(--primary-green)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon bdo-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-green)" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-green)' }}>BDO Reports</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Manage Business Development Officer client reports and communications
            </p>
            <div style={{ marginTop: '12px', padding: '8px', background: 'var(--primary-green)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>
                {bdoClients.length} Total Clients
              </p>
            </div>
          </div>

          <div 
            onClick={() => setCurrentView('software-projects')}
            style={{
              background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid var(--primary-red)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon software-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--primary-red)" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-red)' }}>Software Projects</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Oversee software development projects and developer communications
            </p>
            <div style={{ marginTop: '12px', padding: '8px', background: 'var(--primary-red)', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>
                {softwareProjects.length} Total Projects
              </p>
            </div>
          </div>

          <div 
            onClick={() => setCurrentView('finance')}
            style={{
              background: 'linear-gradient(135deg, #E0F2FE 0%, var(--bg-secondary) 100%)',
              padding: '24px',
              borderRadius: '16px',
              border: '2px solid #0EA5E9',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="professional-icon finance-icon" style={{ fontSize: '48px', marginBottom: '16px' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#0EA5E9" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3 style={{ marginBottom: '8px', color: '#0EA5E9' }}>Finance Management</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              Manage accounts for Main, Software, and Digital Marketing
            </p>
            <div style={{ marginTop: '12px', padding: '8px', background: '#0EA5E9', borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: 'white' }}>
                View All Accounts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>BDO Reports Overview ({bdoClients.length})</h2>
        {bdoClients.length === 0 ? (
          <div className="empty-state">
            <p>No BDO client reports available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {bdoClients.map(client => (
              <div 
                key={client.id} 
                onClick={() => setSelectedBdoClient(client)}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid var(--primary-green)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{client.clientName}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>BDO:</strong> {client.bdoName}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>Status:</strong> {client.status}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Location:</strong> {client.clientLocation}
                </p>
                {client.notes && client.notes.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'var(--light-yellow)', borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark-yellow)' }}>
                      {client.notes.length} Note(s)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Software Projects Overview ({softwareProjects.length})</h2>
        {softwareProjects.length === 0 ? (
          <div className="empty-state">
            <p>No software projects available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {softwareProjects.map(project => (
              <div 
                key={project.id} 
                onClick={() => setSelectedSoftwareProject(project)}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid var(--primary-red)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <h4 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{project.projectName}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>Developer:</strong> {project.developerName}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <strong>Status:</strong> {project.status}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <strong>Client:</strong> {project.clientName}
                </p>
                {project.notes && project.notes.length > 0 && (
                  <div style={{ marginTop: '8px', padding: '8px', background: 'var(--light-yellow)', borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark-yellow)' }}>
                      {project.notes.length} Note(s)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBdoClient && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>BDO Client Details</h2>
            <button className="btn-red" onClick={() => setSelectedBdoClient(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3>{selectedBdoClient.clientName}</h3>
            <p><strong>Location:</strong> {selectedBdoClient.clientLocation}</p>
            <p><strong>Company:</strong> {selectedBdoClient.companyDetails}</p>
            <p><strong>Meeting:</strong> {selectedBdoClient.meetingDate ? 
              `${new Date(selectedBdoClient.meetingDate + (selectedBdoClient.meetingTime ? `T${selectedBdoClient.meetingTime}` : '')).toLocaleDateString()}${selectedBdoClient.meetingTime ? ` at ${selectedBdoClient.meetingTime}` : ''}` 
              : 'Not scheduled'}</p>
            <p><strong>BDO:</strong> {selectedBdoClient.bdoName}</p>
            <p><strong>Status:</strong> <span className={`status ${selectedBdoClient.status.toLowerCase().replace(' ', '_')}`}>{selectedBdoClient.status}</span></p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '12px' }}>
              Added: {new Date(selectedBdoClient.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '16px' }}>Send Note to BDO</h4>
            <textarea
              placeholder="Type your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '12px', border: '2px solid var(--border-color)', borderRadius: '8px', fontFamily: 'inherit', marginBottom: '12px' }}
            />
            <button 
              className="btn-green" 
              onClick={() => handleSendNote(selectedBdoClient.id)}
              style={{ width: '100%' }}
            >
              Send Note
            </button>
          </div>

          {selectedBdoClient.notes && selectedBdoClient.notes.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '16px' }}>Notes History</h4>
              {selectedBdoClient.notes.map(note => (
                <div key={note.id} style={{ 
                  padding: '12px', 
                  marginBottom: '12px', 
                  background: note.seen ? 'var(--light-green)' : 'var(--light-yellow)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{note.text}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Sent by: {note.sentBy} on {new Date(note.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)',
                      color: note.seen ? 'white' : 'var(--dark-yellow)'
                    }}>
                      {note.seen ? 'Seen' : 'Unseen'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSoftwareProject && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Software Project Details</h2>
            <button className="btn-red" onClick={() => setSelectedSoftwareProject(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3>{selectedSoftwareProject.projectName}</h3>
            <p><strong>Description:</strong> {selectedSoftwareProject.projectDescription}</p>
            <p><strong>Technology:</strong> {selectedSoftwareProject.technology}</p>
            <p><strong>Client:</strong> {selectedSoftwareProject.clientName}</p>
            <p><strong>Deadline:</strong> {new Date(selectedSoftwareProject.deadline).toLocaleDateString()}</p>
            <p><strong>Developer:</strong> {selectedSoftwareProject.developerName}</p>
            <p><strong>Status:</strong> <span className={`status ${selectedSoftwareProject.status.toLowerCase().replace(' ', '_')}`}>{selectedSoftwareProject.status}</span></p>
            <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '12px' }}>
              Created: {new Date(selectedSoftwareProject.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '16px' }}>Send Note to Developer</h4>
            <textarea
              placeholder="Type your note here..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows="3"
              style={{ width: '100%', padding: '12px', border: '2px solid var(--border-color)', borderRadius: '8px', fontFamily: 'inherit', marginBottom: '12px' }}
            />
            <button 
              className="btn-green" 
              onClick={() => handleSendProjectNote(selectedSoftwareProject.id)}
              style={{ width: '100%' }}
            >
              Send Note
            </button>
          </div>

          {selectedSoftwareProject.notes && selectedSoftwareProject.notes.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
              <h4 style={{ marginBottom: '16px' }}>Notes History</h4>
              {selectedSoftwareProject.notes.map(note => (
                <div key={note.id} style={{ 
                  padding: '12px', 
                  marginBottom: '12px', 
                  background: note.seen ? 'var(--light-green)' : 'var(--light-yellow)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>{note.text}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Sent by: {note.sentBy} on {new Date(note.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)',
                      color: note.seen ? 'white' : 'var(--dark-yellow)'
                    }}>
                      {note.seen ? 'Seen' : 'Unseen'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Super Admin Controls</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button className="btn-green" onClick={() => setShowCreateForm(!showCreateForm)}>
              {showCreateForm ? 'Cancel' : 'Create New Task'}
            </button>
            <button className="btn-red" onClick={handleClearAll}>
              Clear All Tasks
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text"
                  placeholder="Enter task title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe the task in detail"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Priority Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign to</label>
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  required
                >
                  <option value="">Select Assignee</option>
                  <optgroup label="Employees">
                    {employees.map(emp => (
                      <option key={emp.id || emp.uid} value={emp.name}>
                        {emp.name} ({emp.specialization || emp.employeeId || 'Employee'})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Administrators">
                    <option value="Admin">Admin</option>
                  </optgroup>
                </select>
              </div>
              <div className="form-group">
                <label>Related Client (Optional)</label>
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                >
                  <option value="">No specific client</option>
                  {clients.map(client => (
                    <option key={client.id || client.uid} value={client.email}>{client.name}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-green">Create Task</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in the system. Create one to get started!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p style={{ fontWeight: '500', marginTop: '12px' }}>Client: {task.clientName}</p>
                  {task.assignedTo && (
                    <p style={{ marginTop: '12px', fontWeight: '500' }}>
                      Assigned to: {task.assignedTo}
                    </p>
                  )}
                  {task.assignedBy && (
                    <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                      Assigned by: {task.assignedBy}
                    </p>
                  )}
                  {task.createdBy && (
                    <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                      Created by: {task.createdBy}
                    </p>
                  )}
                  <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </p>

                  {task.status !== 'completed' && (
                    <div className="status-update-section">
                      <h4>Update Task Status</h4>
                      <div className="status-update-form">
                        <select
                          value={statusUpdate[task.id] || ''}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, [task.id]: e.target.value })}
                        >
                          <option value="">Select new status</option>
                          {task.status === 'pending' && <option value="accepted">Accepted</option>}
                          {task.status === 'accepted' && <option value="in_progress">In Progress</option>}
                          {task.status === 'in_progress' && <option value="completed">Completed</option>}
                        </select>
                        <button className="btn-yellow" onClick={() => handleUpdateStatus(task.id, statusUpdate[task.id])}>
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {task.statusHistory && task.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Complete Status History</h4>
                      {task.statusHistory.map((history, idx) => (
                        <div key={idx} className="history-item">
                          <strong>
                            {history.role === 'employee' ? 'Employee' : history.role === 'admin' ? 'Admin' : history.role === 'superadmin' ? 'Super Admin' : 'Client'}
                          </strong> updated to <strong>{history.status.replace('_', ' ')}</strong>
                          <span className="history-timestamp">{new Date(history.updatedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="task-status-sidebar">
                  <div className="status-display">
                    <div className="status-display-label">Status</div>
                    <div className={`status-display-value ${task.status}`}>{task.status.replace('_', ' ')}</div>
                  </div>
                  <div className="priority-display">
                    <div className="priority-display-label">Priority</div>
                    <div className={`priority-display-value ${task.priority}`}>{task.priority}</div>
                  </div>
                  <button className="btn-red" onClick={() => handleDeleteTask(task.id)} style={{ width: '100%', marginTop: '12px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>BDO Client Reports ({bdoClients.length})</h2>
        {bdoClients.length === 0 ? (
          <div className="empty-state">
            <p>No BDO client reports available</p>
          </div>
        ) : (
          bdoClients.map(client => (
            <div key={client.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{client.clientName}</h3>
                  <p><strong>Location:</strong> {client.clientLocation}</p>
                  <p><strong>Company:</strong> {client.companyDetails}</p>
                  <p><strong>Meeting:</strong> {client.meetingDate ? 
                    `${new Date(client.meetingDate + (client.meetingTime ? `T${client.meetingTime}` : '')).toLocaleDateString()}${client.meetingTime ? ` at ${client.meetingTime}` : ''}` 
                    : 'Not scheduled'}</p>
                  <p style={{ fontWeight: '500', marginTop: '12px' }}>BDO: {client.bdoName}</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    Added: {new Date(client.createdAt).toLocaleDateString()}
                  </p>

                  {client.statusHistory && client.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status History</h4>
                      {client.statusHistory.map((history, idx) => (
                        <div key={idx} className="history-item">
                          <strong>BDO ({client.bdoName})</strong> updated to <strong>{history.status}</strong>
                          <span className="history-timestamp">{new Date(history.updatedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="task-status-sidebar">
                  <div className="status-display">
                    <div className="status-display-label">Status</div>
                    <div className={`status-display-value ${client.status.toLowerCase().replace(' ', '_')}`}>
                      {client.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="task-stats-section">
        <div className="task-stat-card completed">
          <div className="task-stat-header">
            <div className="task-stat-title">Completed Tasks</div>
            <div className="task-stat-count completed">{completedTasks.length}</div>
          </div>
          <div className="task-stat-list">
            {completedTasks.length === 0 ? (
              <div className="task-stat-empty">No completed tasks</div>
            ) : (
              completedTasks.map(task => {
                const { day, date, time } = formatDateTime(task.statusHistory?.[task.statusHistory.length - 1]?.updatedAt || task.createdAt)
                return (
                  <div key={task.id} className="task-stat-item completed">
                    <div className="task-stat-item-title" title={task.title}>{task.title}</div>
                    <div className="task-stat-item-time">
                      <span>{day}, {date}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="task-stat-card current">
          <div className="task-stat-header">
            <div className="task-stat-title">Current Tasks</div>
            <div className="task-stat-count current">{currentTasks.length}</div>
          </div>
          <div className="task-stat-list">
            {currentTasks.length === 0 ? (
              <div className="task-stat-empty">No current tasks</div>
            ) : (
              currentTasks.map(task => {
                const { day, date, time } = formatDateTime(task.createdAt)
                return (
                  <div key={task.id} className="task-stat-item current">
                    <div className="task-stat-item-title" title={task.title}>{task.title}</div>
                    <div className="task-stat-item-time">
                      <span>{day}, {date}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="task-stat-card cancelled">
          <div className="task-stat-header">
            <div className="task-stat-title">Cancelled Tasks</div>
            <div className="task-stat-count cancelled">{cancelledTasks.length}</div>
          </div>
          <div className="task-stat-list">
            {cancelledTasks.length === 0 ? (
              <div className="task-stat-empty">No cancelled tasks</div>
            ) : (
              cancelledTasks.map(task => {
                const { day, date, time } = formatDateTime(task.statusHistory?.[task.statusHistory.length - 1]?.updatedAt || task.createdAt)
                return (
                  <div key={task.id} className="task-stat-item cancelled">
                    <div className="task-stat-item-title" title={task.title}>{task.title}</div>
                    <div className="task-stat-item-time">
                      <span>{day}, {date}</span>
                      <span>{time}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
      )}
    </>
  )
}

export default SuperAdminDashboard
