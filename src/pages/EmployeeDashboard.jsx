import { useState, useEffect } from 'react'
import { subscribeToTasks, updateTask } from '../firebase/firestore'

function EmployeeDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [statusUpdate, setStatusUpdate] = useState({})
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Subscribe to real-time tasks updates
    const unsubscribe = subscribeToTasks(user.uid, user.role, (tasksData) => {
      setTasks(tasksData)
    })

    return () => unsubscribe()
  }, [user.uid, user.role])

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
            role: 'employee'
          }
        ]
      })
      
      setStatusUpdate({ ...statusUpdate, [taskId]: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update task status')
    }
  }

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const currentTasks = tasks.filter(t => t.status === 'accepted' || t.status === 'in_progress')
  const cancelledTasks = tasks.filter(t => t.status === 'rejected')

  const statusCounts = {
    accepted: tasks.filter(t => t.status === 'accepted').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: completedTasks.length
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
          <button className="mobile-menu-item" onClick={() => { setMobileMenuOpen(false); onLogout(); }}>Logout</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Employee Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="btn-red">Logout</button>
        </div>
        <button className={`mobile-menu-btn ${mobileMenuOpen ? 'active' : ''}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <h3>New Tasks</h3>
          <div className="stat-value">{statusCounts.accepted}</div>
        </div>
        <div className="stat-card red">
          <h3>In Progress</h3>
          <div className="stat-value">{statusCounts.in_progress}</div>
        </div>
        <div className="stat-card green">
          <h3>Completed</h3>
          <div className="stat-value">{statusCounts.completed}</div>
        </div>
      </div>

      <div className="card">
        <h2>My Assigned Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks assigned yet</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p style={{ fontWeight: '500', marginTop: '8px' }}>From: {task.clientName}</p>

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
                        </select>
                        <button className="btn-green" onClick={() => handleUpdateStatus(task.id, statusUpdate[task.id])}>
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
                          <strong>{history.role === 'employee' ? 'You' : history.role === 'admin' ? 'Admin' : 'Client'}</strong> updated to <strong>{history.status.replace('_', ' ')}</strong>
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

export default EmployeeDashboard
