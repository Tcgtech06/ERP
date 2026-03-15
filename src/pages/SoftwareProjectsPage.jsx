import { useState, useEffect } from 'react'

function SoftwareProjectsPage({ user, onBack }) {
  const [softwareProjects, setSoftwareProjects] = useState([])
  const [selectedSoftwareProject, setSelectedSoftwareProject] = useState(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    loadSoftwareProjects()
    const interval = setInterval(loadSoftwareProjects, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadSoftwareProjects = () => {
    const savedProjects = localStorage.getItem('softwareProjects')
    if (savedProjects) {
      setSoftwareProjects(JSON.parse(savedProjects))
    }
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
  }

  const availableProjects = softwareProjects.filter(p => p.status === 'Available')
  const ongoingProjects = softwareProjects.filter(p => p.status === 'Ongoing' || p.status === 'Project in Production' || p.status === 'Testing' || p.status === 'Deployment')
  const completedProjects = softwareProjects.filter(p => p.status === 'Completed')
  const cancelledProjects = softwareProjects.filter(p => p.status === 'Cancelled')

  const statusCounts = {
    available: availableProjects.length,
    ongoing: ongoingProjects.length,
    completed: completedProjects.length,
    cancelled: cancelledProjects.length,
    total: softwareProjects.length
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
            <h1>Software Projects Management</h1>
            <p>Development Projects Overview</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-yellow">Back to Dashboard</button>
        </div>
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
        <div className="stat-card" style={{ borderLeftColor: '#8B5CF6' }}>
          <h3>Total Projects</h3>
          <div className="stat-value">{statusCounts.total}</div>
        </div>
      </div>

      <div className="card">
        <h2>All Software Projects ({softwareProjects.length})</h2>
        {softwareProjects.length === 0 ? (
          <div className="empty-state">
            <p>No software projects available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {softwareProjects.map(project => (
              <div 
                key={project.id} 
                onClick={() => setSelectedSoftwareProject(project)}
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
                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>{project.projectName}</h3>
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
                <div style={{ marginTop: '12px' }}>
                  <span className={`status ${project.status.toLowerCase().replace(' ', '_')}`}>
                    {project.status}
                  </span>
                  <span className={`priority ${project.priority}`} style={{ marginLeft: '8px' }}>
                    {project.priority} Priority
                  </span>
                </div>
                {project.notes && project.notes.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'var(--light-yellow)', borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark-yellow)' }}>
                      {project.notes.length} Note(s) • {project.notes.filter(n => !n.seen).length} Unread
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedSoftwareProject && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-red) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-red)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Software Project Details</h2>
            <button className="btn-red" onClick={() => setSelectedSoftwareProject(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>{selectedSoftwareProject.projectName}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <p><strong>Description:</strong> {selectedSoftwareProject.projectDescription}</p>
                <p><strong>Technology:</strong> {selectedSoftwareProject.technology}</p>
                <p><strong>Client:</strong> {selectedSoftwareProject.clientName}</p>
              </div>
              <div>
                <p><strong>Developer:</strong> {selectedSoftwareProject.developerName}</p>
                <p><strong>Deadline:</strong> {new Date(selectedSoftwareProject.deadline).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> <span className={`priority ${selectedSoftwareProject.priority}`}>{selectedSoftwareProject.priority}</span></p>
                <p><strong>Status:</strong> <span className={`status ${selectedSoftwareProject.status.toLowerCase().replace(' ', '_')}`}>{selectedSoftwareProject.status}</span></p>
                <p><strong>Created:</strong> {new Date(selectedSoftwareProject.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
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
              <h4 style={{ marginBottom: '16px' }}>Notes History ({selectedSoftwareProject.notes.length})</h4>
              {selectedSoftwareProject.notes.map(note => (
                <div key={note.id} style={{ 
                  padding: '16px', 
                  marginBottom: '12px', 
                  background: note.seen ? 'var(--light-green)' : 'var(--light-yellow)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)'}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>{note.text}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Sent by: {note.sentBy} on {new Date(note.sentAt).toLocaleString()}
                      </p>
                    </div>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      background: note.seen ? 'var(--primary-green)' : 'var(--primary-yellow)',
                      color: note.seen ? 'white' : 'var(--dark-yellow)',
                      marginLeft: '12px'
                    }}>
                      {note.seen ? 'Seen' : 'Unseen'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSoftwareProject.statusHistory && selectedSoftwareProject.statusHistory.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px' }}>Status History</h4>
              {selectedSoftwareProject.statusHistory.map((history, idx) => (
                <div key={idx} className="history-item">
                  <strong>Developer ({selectedSoftwareProject.developerName})</strong> updated to <strong>{history.status}</strong>
                  <span className="history-timestamp">{new Date(history.updatedAt).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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

export default SoftwareProjectsPage