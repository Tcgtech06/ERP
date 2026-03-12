import { useState, useEffect } from 'react'

function ClientDashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')

  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks)
      setTasks(allTasks.filter(t => t.clientEmail === user.email))
    }
  }, [user.email])

  useEffect(() => {
    const interval = setInterval(() => {
      const savedTasks = localStorage.getItem('tasks')
      if (savedTasks) {
        const allTasks = JSON.parse(savedTasks)
        const userTasks = allTasks.filter(t => t.clientEmail === user.email)
        setTasks(userTasks)
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [user.email])

  const handleCreateTask = (e) => {
    e.preventDefault()
    const newTask = {
      id: Date.now(),
      title,
      description,
      priority,
      status: 'pending',
      clientEmail: user.email,
      clientName: user.name,
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'pending', updatedBy: user.name, updatedAt: new Date().toISOString(), role: 'client' }
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
  }

  const completedTasks = tasks.filter(t => t.status === 'completed')
  const currentTasks = tasks.filter(t => t.status === 'pending' || t.status === 'accepted' || t.status === 'in_progress')
  const cancelledTasks = tasks.filter(t => t.status === 'rejected')

  const statusCounts = {
    pending: tasks.filter(t => t.status === 'pending').length,
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
      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Client Dashboard</h1>
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
      </div>

      <div className="card">
        <h2>Create New Task</h2>
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
          <button type="submit" className="btn-green">Create Task</button>
        </form>
      </div>

      <div className="card">
        <h2>My Tasks ({tasks.length})</h2>
        {tasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks created yet. Create your first task above!</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  {task.assignedTo && <p style={{ marginTop: '12px', fontWeight: '500' }}>Assigned to: {task.assignedTo}</p>}
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    Created: {new Date(task.createdAt).toLocaleDateString()}
                  </p>

                  {task.statusHistory && task.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status Updates</h4>
                      {task.statusHistory.map((history, idx) => (
                        <div key={idx} className="history-item">
                          <strong>{history.role === 'employee' ? 'Employee' : history.role === 'admin' ? 'Admin' : 'You'}</strong> updated to <strong>{history.status.replace('_', ' ')}</strong>
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

export default ClientDashboard
