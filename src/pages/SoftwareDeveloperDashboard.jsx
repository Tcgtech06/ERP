import { useState, useEffect } from 'react'

function SoftwareDeveloperDashboard({ user, onLogout }) {
  const [projects, setProjects] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [technology, setTechnology] = useState('')
  const [clientName, setClientName] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('Available')
  const [statusUpdate, setStatusUpdate] = useState({})
  const [visibleNotes, setVisibleNotes] = useState(new Set())

  const predefinedStatuses = [
    'Available',
    'Ongoing',
    'Project in Production',
    'Testing',
    'Deployment',
    'Completed',
    'Cancelled'
  ]

  useEffect(() => {
    loadProjects()
    const interval = setInterval(loadProjects, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const noteId = entry.target.getAttribute('data-note-id')
          const projectId = entry.target.getAttribute('data-project-id')
          
          if (noteId && projectId && !visibleNotes.has(`${projectId}-${noteId}`)) {
            setVisibleNotes(prev => new Set([...prev, `${projectId}-${noteId}`]))
            handleMarkNoteSeen(parseInt(projectId), parseInt(noteId))
          }
        }
      })
    }, { threshold: 0.5 })

    const noteElements = document.querySelectorAll('[data-note-id]')
    noteElements.forEach(el => observer.observe(el))

    return () => {
      noteElements.forEach(el => observer.unobserve(el))
    }
  }, [projects, visibleNotes])

  const loadProjects = () => {
    const savedProjects = localStorage.getItem('softwareProjects')
    if (savedProjects) {
      const allProjects = JSON.parse(savedProjects)
      // Show projects created by this developer OR assigned to this developer
      const userProjects = allProjects.filter(p => 
        p.developerEmail === user.email || p.developerName === user.name
      )
      setProjects(userProjects)
    }
  }

  const handleCreateProject = (e) => {
    e.preventDefault()
    
    const newProject = {
      id: Date.now(),
      projectName,
      projectDescription,
      technology,
      clientName,
      deadline,
      priority,
      status,
      developerName: user.name,
      developerEmail: user.email,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status,
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'developer'
        }
      ]
    }

    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    allProjects.push(newProject)
    localStorage.setItem('softwareProjects', JSON.stringify(allProjects))

    setProjects([...projects, newProject])
    
    // Reset form
    setProjectName('')
    setProjectDescription('')
    setTechnology('')
    setClientName('')
    setDeadline('')
    setPriority('medium')
    setStatus('Available')
    setShowCreateForm(false)
  }

  const handleUpdateStatus = (projectId, newStatus) => {
    if (!newStatus) return

    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = allProjects.map(p => {
      if (p.id === projectId) {
        const history = p.statusHistory || []
        return {
          ...p,
          status: newStatus,
          statusHistory: [...history, {
            status: newStatus,
            updatedBy: user.name,
            updatedAt: new Date().toISOString(),
            role: 'developer'
          }]
        }
      }
      return p
    })
    localStorage.setItem('softwareProjects', JSON.stringify(updatedProjects))
    loadProjects()
    setStatusUpdate({ ...statusUpdate, [projectId]: '' })
  }

  const handleMarkNoteSeen = (projectId, noteId) => {
    const savedProjects = localStorage.getItem('softwareProjects')
    const allProjects = savedProjects ? JSON.parse(savedProjects) : []
    const updatedProjects = allProjects.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          notes: p.notes.map(n => n.id === noteId ? { ...n, seen: true } : n)
        }
      }
      return p
    })
    localStorage.setItem('softwareProjects', JSON.stringify(updatedProjects))
    loadProjects()
  }

  const availableProjects = projects.filter(p => p.status === 'Available')
  const ongoingProjects = projects.filter(p => p.status === 'Ongoing' || p.status === 'Project in Production' || p.status === 'Testing' || p.status === 'Deployment')
  const completedProjects = projects.filter(p => p.status === 'Completed')
  const cancelledProjects = projects.filter(p => p.status === 'Cancelled')

  const statusCounts = {
    available: availableProjects.length,
    ongoing: ongoingProjects.length,
    completed: completedProjects.length,
    cancelled: cancelledProjects.length,
    total: projects.length
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
            <h1>Software Developer Dashboard</h1>
            <p>Welcome back, {user.name}</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onLogout} className="btn-red">Logout</button>
        </div>
      </div>

      <div style={{ display: 'none' }} className="mobile-add-project-btn">
        <button className="btn-green" onClick={() => setShowCreateForm(!showCreateForm)} style={{ width: '100%', marginBottom: '16px' }}>
          {showCreateForm ? 'Cancel' : 'Add New Project'}
        </button>
        
        {showCreateForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  placeholder="Describe the project"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {predefinedStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-green">Add Project</button>
            </form>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <h3>Available</h3>
          <div className="stat-value">{statusCounts.available}</div>
        </div>
        <div className="stat-card red">
          <h3>Ongoing</h3>
          <div className="stat-value">{statusCounts.ongoing}</div>
        </div>
        <div className="stat-card green">
          <h3>Completed</h3>
          <div className="stat-value">{statusCounts.completed}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#DC2626' }}>
          <h3>Cancelled</h3>
          <div className="stat-value">{statusCounts.cancelled}</div>
        </div>
      </div>

      {projects.some(p => p.notes && p.notes.some(n => !n.seen)) && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-yellow) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-yellow)' }}>
          <h2 style={{ color: 'var(--dark-yellow)' }}>New Notes from Super Admin</h2>
          {projects.map(project => {
            const unreadNotes = project.notes ? project.notes.filter(n => !n.seen) : []
            return unreadNotes.length > 0 ? (
              <div key={project.id} style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Project: {project.projectName}</h4>
                {unreadNotes.map(note => (
                  <div 
                    key={note.id}
                    data-note-id={note.id}
                    data-project-id={project.id}
                    style={{
                      background: 'var(--bg-secondary)',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      borderLeft: '4px solid var(--primary-yellow)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ marginBottom: '4px' }}>{note.text}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        From: {note.sentBy} on {new Date(note.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{ 
                      marginLeft: '12px',
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: 'var(--primary-yellow)',
                      color: 'var(--dark-yellow)',
                      whiteSpace: 'nowrap'
                    }}>
                      Unseen
                    </span>
                  </div>
                ))}
              </div>
            ) : null
          })}
        </div>
      )}

      <div className="card desktop-project-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Project Management</h2>
          <button className="btn-green desktop-add-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Add New Project'}
          </button>
        </div>

        {showCreateForm && (
          <div className="desktop-form" style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Project Description</label>
                <textarea
                  placeholder="Describe the project"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Technology Stack</label>
                <input
                  type="text"
                  placeholder="e.g., React, Node.js, MongoDB"
                  value={technology}
                  onChange={(e) => setTechnology(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Client Name</label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {predefinedStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-green">Add Project</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>My Projects ({projects.length})</h2>
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects added yet. Add your first project above!</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{project.projectName}</h3>
                  <p><strong>Description:</strong> {project.projectDescription}</p>
                  <p><strong>Technology:</strong> {project.technology}</p>
                  <p><strong>Client:</strong> {project.clientName}</p>
                  <p><strong>Deadline:</strong> {new Date(project.deadline).toLocaleDateString()}</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    Created: {new Date(project.createdAt).toLocaleDateString()}
                  </p>

                  {project.status !== 'Completed' && project.status !== 'Cancelled' && (
                    <div className="status-update-section">
                      <h4>Update Project Status</h4>
                      <div className="status-update-form">
                        <select
                          value={statusUpdate[project.id] || ''}
                          onChange={(e) => setStatusUpdate({ ...statusUpdate, [project.id]: e.target.value })}
                        >
                          <option value="">Select new status</option>
                          {predefinedStatuses.filter(s => s !== project.status).map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        <button className="btn-yellow" onClick={() => handleUpdateStatus(project.id, statusUpdate[project.id])}>
                          Update
                        </button>
                      </div>
                    </div>
                  )}

                  {project.statusHistory && project.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status History</h4>
                      {project.statusHistory.map((history, idx) => (
                        <div key={idx} className="history-item">
                          <strong>You</strong> updated to <strong>{history.status}</strong>
                          <span className="history-timestamp">{new Date(history.updatedAt).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="task-status-sidebar">
                  <div className="status-display">
                    <div className="status-display-label">Status</div>
                    <div className={`status-display-value ${project.status.toLowerCase().replace(' ', '_')}`}>
                      {project.status}
                    </div>
                  </div>
                  <div className="priority-display">
                    <div className="priority-display-label">Priority</div>
                    <div className={`priority-display-value ${project.priority}`}>{project.priority}</div>
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
            <div className="task-stat-title">Completed Projects</div>
            <div className="task-stat-count completed">{completedProjects.length}</div>
          </div>
          <div className="task-stat-list">
            {completedProjects.length === 0 ? (
              <div className="task-stat-empty">No completed projects</div>
            ) : (
              completedProjects.map(project => {
                const { day, date, time } = formatDateTime(project.statusHistory?.[project.statusHistory.length - 1]?.updatedAt || project.createdAt)
                return (
                  <div key={project.id} className="task-stat-item completed">
                    <div className="task-stat-item-title" title={project.projectName}>{project.projectName}</div>
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
            <div className="task-stat-title">Ongoing Projects</div>
            <div className="task-stat-count current">{ongoingProjects.length}</div>
          </div>
          <div className="task-stat-list">
            {ongoingProjects.length === 0 ? (
              <div className="task-stat-empty">No ongoing projects</div>
            ) : (
              ongoingProjects.map(project => {
                const { day, date, time } = formatDateTime(project.createdAt)
                return (
                  <div key={project.id} className="task-stat-item current">
                    <div className="task-stat-item-title" title={project.projectName}>{project.projectName}</div>
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
            <div className="task-stat-title">Cancelled Projects</div>
            <div className="task-stat-count cancelled">{cancelledProjects.length}</div>
          </div>
          <div className="task-stat-list">
            {cancelledProjects.length === 0 ? (
              <div className="task-stat-empty">No cancelled projects</div>
            ) : (
              cancelledProjects.map(project => {
                const { day, date, time } = formatDateTime(project.statusHistory?.[project.statusHistory.length - 1]?.updatedAt || project.createdAt)
                return (
                  <div key={project.id} className="task-stat-item cancelled">
                    <div className="task-stat-item-title" title={project.projectName}>{project.projectName}</div>
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

export default SoftwareDeveloperDashboard