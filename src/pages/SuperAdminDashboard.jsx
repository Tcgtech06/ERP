import { useState, useEffect } from 'react'

const mockEmployees = [
  { id: 1, name: 'John Employee', email: 'employee@test.com' },
  { id: 2, name: 'Jane Worker', email: 'jane@test.com' },
  { id: 3, name: 'Bob Staff', email: 'bob@test.com' }
]

const mockClients = [
  { id: 1, name: 'Client User', email: 'client@test.com' },
  { id: 2, name: 'Alice Client', email: 'alice@test.com' },
  { id: 3, name: 'Bob Client', email: 'bob.client@test.com' }
]

function SuperAdminDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [bdoClients, setBdoClients] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [selectedClient, setSelectedClient] = useState('')
  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({})
  const [selectedBdoClient, setSelectedBdoClient] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [showNoteForm, setShowNoteForm] = useState({})

  useEffect(() => {
    loadTasks()
    loadBdoClients()
    const interval = setInterval(() => {
      loadTasks()
      loadBdoClients()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }

  const loadBdoClients = () => {
    const savedClients = localStorage.getItem('bdoClients')
    if (savedClients) {
      setBdoClients(JSON.parse(savedClients))
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

  const handleCreateTask = (e) => {
    e.preventDefault()
    
    const client = mockClients.find(c => c.email === selectedClient)
    const employee = mockEmployees.find(emp => emp.name === selectedEmployee)
    
    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      status: employee ? 'accepted' : 'pending',
      clientEmail: client.email,
      clientName: client.name,
      assignedTo: employee ? employee.name : null,
      assignedBy: user.name,
      createdAt: new Date().toISOString(),
      createdBy: user.name,
      statusHistory: [
        {
          status: employee ? 'accepted' : 'pending',
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'superadmin'
        }
      ]
    }

    const savedTasks = localStorage.getItem('tasks')
    const allTasks = savedTasks ? JSON.parse(savedTasks) : []
    allTasks.push(newTask)
    localStorage.setItem('tasks', JSON.stringify(allTasks))

    setTasks([...tasks, newTask])
    setTitle('')
    setDescription('')
    setPriority('medium')
    setSelectedClient('')
    setSelectedEmployee('')
    setShowCreateForm(false)
  }

  const handleDeleteTask = (taskId) => {
    if (!confirm('Delete this task?')) return
    
    const savedTasks = localStorage.getItem('tasks')
    const allTasks = savedTasks ? JSON.parse(savedTasks) : []
    const updatedTasks = allTasks.filter(t => t.id !== taskId)
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    loadTasks()
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
            role: 'superadmin'
          }]
        }
      }
      return t
    })
    localStorage.setItem('tasks', JSON.stringify(updatedTasks))
    loadTasks()
    setStatusUpdate({ ...statusUpdate, [taskId]: '' })
  }

  const handleClearAll = () => {
    if (!confirm('Clear all tasks? This action cannot be undone.')) return
    localStorage.removeItem('tasks')
    setTasks([])
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
    <div className="container">
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
                <label>Assign to Client</label>
                <select 
                  value={selectedClient} 
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                >
                  <option value="">Select Client</option>
                  {mockClients.map(client => (
                    <option key={client.id} value={client.email}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assign to Employee (Optional)</label>
                <select 
                  value={selectedEmployee} 
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Leave Unassigned</option>
                  {mockEmployees.map(emp => (
                    <option key={emp.id} value={emp.name}>{emp.name}</option>
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
  )
}

export default SuperAdminDashboard
