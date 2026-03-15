import { useState, useEffect } from 'react'

const mockEmployees = [
  { id: 1, name: 'John Employee', email: 'employee@test.com', specialization: 'Software' },
  { id: 2, name: 'Jane Worker', email: 'jane@test.com', specialization: 'Digital Marketing' },
  { id: 3, name: 'Bob Staff', email: 'bob@test.com', specialization: 'Software' }
]

function AdminDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState({})
  const [statusUpdate, setStatusUpdate] = useState({})
  const [selectedProjectEmployee, setSelectedProjectEmployee] = useState({})

  useEffect(() => {
    loadTasks()
    loadProjects()
    const interval = setInterval(() => {
      loadTasks()
      loadProjects()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('softwareProjects')
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects))
    }
  }

  const handleAssignTask = (taskId, employeeName) => {
    if (!employeeName) return

    const savedTasks = localStorage.getItem('tasks')
    const allTasks = savedTasks ? JSON.parse(savedTasks) : []
    const updatedTasks = allTasks.map(t => {
      if (t.id === taskId) {
        const history = t.statusHistory || []
        return {
          ...t,
          status: 'accepted',
          assignedTo: employeeName,
          assignedBy: user.name,
          statusHistory: [...history, {
            status: 'accepted',
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'admin'
          }]
        }
      }
      return t
    })
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    loadTasks()
    setSelectedEmployee({ ...selectedEmployee, [taskId]: '' })
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

  const handleUpdateStatus = (taskId, newStatus) => {
    if (!newStatus) return

    const savedTasks = localStorage.getItem('tasks')
    const allTasks = savedTasks ? JSON.parse(savedTasks) : []
    const updatedTasks = allTasks.map(t => {
      if (t.id === taskId) {
        const history = t.statusHistory || []
        return {
          ...t,
          status: newStatus,
          statusHistory: [...history, {
            status: newStatus,
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'admin'
          }]
        }
      }
      return t
    })
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    loadTasks()
    setStatusUpdate({ ...statusUpdate, [taskId]: '' })
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
                    >
                      <option value="">Select Employee</option>
                      {mockEmployees.map(emp => (
                        <option key={emp.id} value={emp.name}>{emp.name}</option>
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
