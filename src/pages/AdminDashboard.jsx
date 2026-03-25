import { useState, useEffect } from 'react'
import { subscribeToTasks, updateTask, getEmployees, createTask, getUsers } from '../firebase/firestore'

const mockEmployees = [
  { id: 1, name: 'Software Employee', email: 'TT001', employeeId: 'TT001', specialization: 'Software' },
  { id: 2, name: 'Digital Marketing Employee', email: 'TD001', employeeId: 'TD001', specialization: 'Digital Marketing' },
  { id: 3, name: 'BDO Employee', email: 'TB001', employeeId: 'TB001', specialization: 'BDO' }
]

function AdminDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [employees, setEmployees] = useState(mockEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState({})
  const [statusUpdate, setStatusUpdate] = useState({})
  const [selectedProjectEmployee, setSelectedProjectEmployee] = useState({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployeeForTask, setSelectedEmployeeForTask] = useState('')
  const [clients, setClients] = useState([])

  useEffect(() => {
    // Subscribe to real-time tasks updates
    const unsubscribe = subscribeToTasks(user.uid, user.role, (tasksData) => {
      setTasks(tasksData)
    })

    // Load employees and clients from Firebase
    loadEmployees()
    loadClients()

    return () => unsubscribe()
  }, [user.uid, user.role])

  const loadClients = async () => {
    try {
      const usersData = await getUsers()
      const clientUsers = usersData.filter(u => u.role === 'client')
      setClients(clientUsers)
    } catch (error) {
      console.error('Error loading clients:', error)
    }
  }

  const loadEmployees = async () => {
    try {
      console.log('📥 Admin: Loading employees...');
      const employeesData = await getEmployees()
      console.log('Employees data from Firebase:', employeesData);
      
      // ALWAYS ensure all 3 employee types are available
      if (employeesData.length > 0) {
        console.log('✅ Using Firebase employees:', employeesData.length);
        // Merge Firebase data with mock data
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
      console.error('❌ Error loading employees:', error)
      setEmployees(mockEmployees)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!selectedEmployeeForTask) {
      alert('Please select an employee to assign the task')
      return
    }
    
    const client = selectedClient ? clients.find(c => c.email === selectedClient) : null
    const employee = employees.find(emp => emp.name === selectedEmployeeForTask)
    
    const newTask = {
      title,
      description,
      priority,
      status: 'accepted',
      clientId: client?.uid || client?.id || null,
      clientEmail: client?.email || null,
      clientName: client?.name || 'No specific client',
      assignedTo: employee ? (employee.uid || employee.id) : null,
      assignedToName: selectedEmployeeForTask,
      assignedBy: user.name,
      createdBy: user.name,
      statusHistory: [
        {
          status: 'accepted',
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'admin'
        }
      ]
    }

    try {
      await createTask(newTask)
      setTitle('')
      setDescription('')
      setPriority('medium')
      setSelectedClient('')
      setSelectedEmployeeForTask('')
      setShowCreateForm(false)
      alert('Task created and assigned successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      alert('Failed to create task')
    }
  }

  const handleAssignTask = async (taskId, employeeName) => {
    if (!employeeName) {
      alert('Please select an employee')
      return
    }

    try {
      const employee = employees.find(emp => emp.name === employeeName)
      await updateTask(taskId, {
        status: 'accepted',
        assignedTo: employee?.uid || employee?.id,
        assignedToName: employeeName,
        assignedBy: user.name,
        statusHistory: [
          {
            status: 'accepted',
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'admin'
          }
        ]
      })
      
      setSelectedEmployee({ ...selectedEmployee, [taskId]: '' })
    } catch (error) {
      console.error('Error assigning task:', error)
      alert('Failed to assign task')
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
            role: 'admin'
          }
        ]
      })
      
      setStatusUpdate({ ...statusUpdate, [taskId]: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update task status')
    }
  }

  const handleAssignProject = (projectId, employeeName) => {
    if (!employeeName) return

    const employee = mockEmployees.find(emp => emp.name === employeeName)
    if (!employee || employee.specialization !== 'Software') {
      alert('Only software development employees can be assigned to projects')
      return
    }

    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = allProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          assignedTo: employeeName,
          assignedBy: user.name,
          assignedAt: new Date().toISOString(),
          statusHistory: [...(p.statusHistory || []), {
            status: 'Assigned to Employee',
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'admin'
          }]
        }
      }
      return p
    })
    localStorage.setItem('softwareProjects', JSON.stringify(updatedProjects))
    loadProjects()
    setSelectedProjectEmployee({ ...selectedProjectEmployee, [projectId]: '' })
  }

  const pendingTasks = tasks.filter(t => t.status === 'pending')
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const currentTasks = tasks.filter(t => t.status === 'pending' || t.status === 'accepted' || t.status === 'in_progress')
  const cancelledTasks = tasks.filter(t => t.status === 'rejected')
  const assignedCount = tasks.filter(t => t.assignedTo).length
  const availableProjects = projects.filter(p => !p.assignedTo && p.status === 'Available')
  const softwareEmployees = mockEmployees.filter(emp => emp.specialization === 'Software')

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = days[date.getDay()]
    const dateStr = date.toLocaleDateString()
    const timeStr = date.toLocaleTimeString()
    return { day, date: dateStr, time: timeStr }
  }

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
          <button className="mobile-menu-item" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Admin Dashboard</h1>
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
          <h3>Pending Tasks</h3>
          <div className="stat-value">{pendingTasks.length}</div>
        </div>
        <div className="stat-card green">
          <h3>Assigned Tasks</h3>
          <div className="stat-value">{assignedCount}</div>
        </div>
        <div className="stat-card red">
          <h3>Total Tasks</h3>
          <div className="stat-value">{tasks.length}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Available Projects</h3>
          <div className="stat-value">{availableProjects.length}</div>
        </div>
      </div>

      {availableProjects.length > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-red)' }}>
          <h2>Software Project Assignment</h2>
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
                borderLeft: '4px solid var(--primary-red)'
              }}>
                <h4 style={{ marginBottom: '12px' }}>{project.projectName}</h4>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Developer:</strong> {project.developerName}
                </p>
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
                    value={selectedProjectEmployee[project.id] || ''}
                    onChange={(e) => setSelectedProjectEmployee({ ...selectedProjectEmployee, [project.id]: e.target.value })}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">Assign to Software Employee</option>
                    {softwareEmployees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name}</option>
                    ))}
                  </select>
                  <button 
                    className="btn-red" 
                    onClick={() => handleAssignProject(project.id, selectedProjectEmployee[project.id])}
                    style={{ padding: '8px 16px' }}
                  >
                    Assign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Admin Controls</h2>
          <button className="btn-green" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create New Task'}
          </button>
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
                <label>Assign to Employee</label>
                <select 
                  value={selectedEmployeeForTask} 
                  onChange={(e) => setSelectedEmployeeForTask(e.target.value)}
                  required
                >
                  <option value="">Select Employee</option>
                  {employees.map(emp => (
                    <option key={emp.id || emp.uid} value={emp.name}>
                      {emp.name} ({emp.specialization || emp.employeeId || 'Employee'})
                    </option>
                  ))}
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
        <h2>Pending Tasks ({pendingTasks.length})</h2>
        {pendingTasks.length === 0 ? (
          <div className="empty-state">
            <p>No pending tasks to assign</p>
          </div>
        ) : (
          pendingTasks.map(task => (
            <div key={task.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p style={{ fontWeight: '500', marginTop: '8px' }}>From: {task.clientName}</p>
                  <div className="task-actions">
                    <select
                      value={selectedEmployee[task.id] || ''}
                      onChange={(e) => setSelectedEmployee({ ...selectedEmployee, [task.id]: e.target.value })}
                      required
                    >
                      <option value="">Select Employee to Assign</option>
                      {employees.map(emp => (
                        <option key={emp.id || emp.uid} value={emp.name}>
                          {emp.name} ({emp.specialization || emp.employeeId || 'Employee'})
                        </option>
                      ))}
                    </select>
                    <button className="btn-green" onClick={() => handleAssignTask(task.id, selectedEmployee[task.id])}>
                      Assign Task
                    </button>
                  </div>
                </div>

                <div className="task-status-sidebar">
                  <div className="priority-display">
                    <div className="priority-display-label">Priority</div>
                    <div className={`priority-display-value ${task.priority}`}>{task.priority}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h2>All Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks in the system</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    From: {task.clientName}
                  </p>
                  {task.assignedTo && <p style={{ marginTop: '12px', fontWeight: '500' }}>Assigned to: {task.assignedTo}</p>}

                  {task.status !== 'completed' && (
                    <div className="status-update-section">
                      <h4>Update Task Status</h4>
                      <div className="status-update-form">
                        <select
                          value={statusUpdate[task.id] || ''}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, [task.id]: e.target.value })}
                        >
                          <option value="">Select new status</option>
                          {task.status === 'accepted' && <option value="in_progress">In Progress</option>}
                          {task.status === 'in_progress' && <option value="completed">Completed</option>}
                          {task.status === 'pending' && <option value="accepted">Accepted</option>}
                        </select>
                        <button className="btn-yellow" onClick={() => handleUpdateStatus(task.id, statusUpdate[task.id])}>
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {task.statusHistory && task.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status Updates</h4>
                      {task.statusHistory.map((history, idx) => (
                        <div key={idx} className="history-item">
                          <strong>{history.role === 'employee' ? 'Employee' : history.role === 'admin' ? 'Admin' : 'Client'}</strong> updated to <strong>{history.status.replace('_', ' ')}</strong>
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
  )
}

export default AdminDashboard
