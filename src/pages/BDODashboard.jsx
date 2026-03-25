import { useState, useEffect } from 'react'
import { createBDOClient, updateBDOClient, subscribeToBDOClients } from '../firebase/firestore'

function BDODashboard({ user, onLogout }) {
  const [clients, setClients] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientLocation, setClientLocation] = useState('')
  const [meetingDate, setMeetingDate] = useState('')
  const [meetingTime, setMeetingTime] = useState('')
  const [companyDetails, setCompanyDetails] = useState('')
  const [status, setStatus] = useState('Meeting scheduled')
  const [customStatus, setCustomStatus] = useState('')
  const [statusUpdate, setStatusUpdate] = useState({})
  const [customStatusUpdate, setCustomStatusUpdate] = useState({})
  const [visibleNotes, setVisibleNotes] = useState(new Set())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const predefinedStatuses = [
    'Meeting scheduled',
    'Enquired',
    'Converted',
    'Meeting canceled',
    'Meeting postponed',
    'Custom'
  ]

  useEffect(() => {
    // Subscribe to real-time BDO clients updates
    const unsubscribe = subscribeToBDOClients((clientsData) => {
      setClients(clientsData)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const noteId = entry.target.getAttribute('data-note-id')
          const clientId = entry.target.getAttribute('data-client-id')
          
          if (noteId && clientId && !visibleNotes.has(`${clientId}-${noteId}`)) {
            setVisibleNotes(prev => new Set([...prev, `${clientId}-${noteId}`]))
            handleMarkNoteSeen(clientId, parseInt(noteId))
          }
        }
      })
    }, { threshold: 0.5 })

    const noteElements = document.querySelectorAll('[data-note-id]')
    noteElements.forEach(el => observer.observe(el))

    return () => {
      noteElements.forEach(el => observer.unobserve(el))
    }
  }, [clients, visibleNotes])

  const handleCreateClient = async (e) => {
    e.preventDefault()
    
    const finalStatus = status === 'Custom' ? customStatus : status
    
    const newClient = {
      clientName,
      clientLocation,
      meetingDate,
      meetingTime,
      companyDetails,
      status: finalStatus,
      bdoName: user.name,
      bdoEmail: user.email,
      bdoId: user.uid || user.id,
      statusHistory: [
        {
          status: finalStatus,
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'bdo'
        }
      ],
      notes: []
    }

    try {
      await createBDOClient(newClient)
      
      // Reset form
      setClientName('')
      setClientLocation('')
      setMeetingDate('')
      setMeetingTime('')
      setCompanyDetails('')
      setStatus('Meeting scheduled')
      setCustomStatus('')
      setShowCreateForm(false)
    } catch (error) {
      console.error('Error creating client:', error)
      alert('Failed to create client')
    }
  }

  const handleUpdateStatus = async (clientId, newStatus, customStatusValue = '') => {
    if (!newStatus) return

    const finalStatus = newStatus === 'Custom' ? customStatusValue : newStatus
    if (newStatus === 'Custom' && !customStatusValue) return

    const client = clients.find(c => c.id === clientId)
    if (!client) return

    const history = client.statusHistory || []
    
    try {
      await updateBDOClient(clientId, {
        status: finalStatus,
        statusHistory: [...history, {
          status: finalStatus,
          updatedBy: user.name,
          updatedAt: new Date().toISOString(),
          role: 'bdo'
        }]
      })
      
      setStatusUpdate({ ...statusUpdate, [clientId]: '' })
      setCustomStatusUpdate({ ...customStatusUpdate, [clientId]: '' })
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const handleMarkNoteSeen = async (clientId, noteId) => {
    const client = clients.find(c => c.id === clientId)
    if (!client) return

    const updatedNotes = client.notes.map(n => 
      n.id === noteId ? { ...n, seen: true } : n
    )

    try {
      await updateBDOClient(clientId, { notes: updatedNotes })
    } catch (error) {
      console.error('Error marking note as seen:', error)
    }
  }

  const completedClients = clients.filter(c => c.status === 'Converted')
  const currentClients = clients.filter(c => c.status === 'Meeting scheduled' || c.status === 'Enquired')
  const cancelledClients = clients.filter(c => c.status === 'Meeting canceled' || c.status === 'Meeting postponed')

  const statusCounts = {
    scheduled: clients.filter(c => c.status === 'Meeting scheduled').length,
    enquired: clients.filter(c => c.status === 'Enquired').length,
    converted: completedClients.length,
    canceled: clients.filter(c => c.status === 'Meeting canceled').length,
    postponed: clients.filter(c => c.status === 'Meeting postponed').length
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = days[date.getDay()]
    const dateStr = date.toLocaleDateString()
    const timeStr = date.toLocaleTimeString()
    return { day, date: dateStr, time: timeStr }
  }

  const formatMeetingDateTime = (dateStr, timeStr) => {
    if (!dateStr) return 'Not scheduled'
    const date = new Date(dateStr + (timeStr ? `T${timeStr}` : ''))
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const day = days[date.getDay()]
    const dateFormatted = date.toLocaleDateString()
    const timeFormatted = timeStr ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
    return `${day}, ${dateFormatted}${timeFormatted ? ` at ${timeFormatted}` : ''}`
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
            <h1>BDO Dashboard</h1>
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

      <div style={{ display: 'none' }} className="mobile-add-client-btn">
        <button className="btn-green" onClick={() => setShowCreateForm(!showCreateForm)} style={{ width: '100%', marginBottom: '16px' }}>
          {showCreateForm ? 'Cancel' : 'Add New Client'}
        </button>
        
        {showCreateForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Client</h3>
            <form onSubmit={handleCreateClient}>
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
                <label>Client Location</label>
                <input
                  type="text"
                  placeholder="Enter client location"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meeting Time</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Company Details</label>
                <textarea
                  placeholder="Enter company details"
                  value={companyDetails}
                  onChange={(e) => setCompanyDetails(e.target.value)}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {predefinedStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {status === 'Custom' && (
                <div className="form-group">
                  <label>Custom Status</label>
                  <input
                    type="text"
                    placeholder="Enter custom status"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    required
                  />
                </div>
              )}
              <button type="submit" className="btn-green">Add Client</button>
            </form>
          </div>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card yellow">
          <h3>Scheduled</h3>
          <div className="stat-value">{statusCounts.scheduled}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Enquired</h3>
          <div className="stat-value">{statusCounts.enquired}</div>
        </div>
        <div className="stat-card green">
          <h3>Converted</h3>
          <div className="stat-value">{statusCounts.converted}</div>
        </div>
        <div className="stat-card red">
          <h3>Canceled</h3>
          <div className="stat-value">{statusCounts.canceled}</div>
        </div>
      </div>

      {clients.some(c => c.notes && c.notes.some(n => !n.seen)) && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-yellow) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-yellow)' }}>
          <h2 style={{ color: 'var(--dark-yellow)' }}>New Notes from Super Admin</h2>
          {clients.map(client => {
            const unreadNotes = client.notes ? client.notes.filter(n => !n.seen) : []
            return unreadNotes.length > 0 ? (
              <div key={client.id} style={{ marginBottom: '16px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>Client: {client.clientName}</h4>
                {unreadNotes.map(note => (
                  <div 
                    key={note.id}
                    data-note-id={note.id}
                    data-client-id={client.id}
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

      <div className="card desktop-client-management">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h2>Client Management</h2>
          <button className="btn-green desktop-add-btn" onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Add New Client'}
          </button>
        </div>

        {showCreateForm && (
          <div className="desktop-form" style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginTop: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Client</h3>
            <form onSubmit={handleCreateClient}>
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
                <label>Client Location</label>
                <input
                  type="text"
                  placeholder="Enter client location"
                  value={clientLocation}
                  onChange={(e) => setClientLocation(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meeting Date</label>
                <input
                  type="date"
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Meeting Time</label>
                <input
                  type="time"
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Company Details</label>
                <textarea
                  placeholder="Enter company details"
                  value={companyDetails}
                  onChange={(e) => setCompanyDetails(e.target.value)}
                  required
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}>
                  {predefinedStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              {status === 'Custom' && (
                <div className="form-group">
                  <label>Custom Status</label>
                  <input
                    type="text"
                    placeholder="Enter custom status"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    required
                  />
                </div>
              )}
              <button type="submit" className="btn-green">Add Client</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>My Clients ({clients.length})</h2>
        {clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients added yet. Add your first client above!</p>
          </div>
        ) : (
          clients.map(client => (
            <div key={client.id} className="card task">
              <div className="task-card-wrapper">
                <div className="task-card-content">
                  <h3>{client.clientName}</h3>
                  <p><strong>Location:</strong> {client.clientLocation}</p>
                  <p><strong>Company:</strong> {client.companyDetails}</p>
                  <p><strong>Meeting:</strong> {formatMeetingDateTime(client.meetingDate, client.meetingTime)}</p>
                  <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '8px' }}>
                    Added: {new Date(client.createdAt).toLocaleDateString()}
                  </p>

                  <div className="status-update-section">
                    <h4>Update Status</h4>
                    <div className="status-update-form">
                      <select
                        value={statusUpdate[client.id] || ''}
                        onChange={(e) => setStatusUpdate({ ...statusUpdate, [client.id]: e.target.value })}
                      >
                        <option value="">Select new status</option>
                        {predefinedStatuses.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {statusUpdate[client.id] === 'Custom' && (
                        <input
                          type="text"
                          placeholder="Enter custom status"
                          value={customStatusUpdate[client.id] || ''}
                          onChange={(e) => setCustomStatusUpdate({ ...customStatusUpdate, [client.id]: e.target.value })}
                          style={{ margin: '8px 0', flex: '1' }}
                        />
                      )}
                      <button 
                        className="btn-yellow" 
                        onClick={() => handleUpdateStatus(
                          client.id, 
                          statusUpdate[client.id], 
                          customStatusUpdate[client.id]
                        )}
                      >
                        Update
                      </button>
                    </div>
                  </div>

                  {client.statusHistory && client.statusHistory.length > 0 && (
                    <div className="status-history">
                      <h4>Status History</h4>
                      {client.statusHistory.map((history, idx) => (
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
            <div className="task-stat-title">Converted Clients</div>
            <div className="task-stat-count completed">{completedClients.length}</div>
          </div>
          <div className="task-stat-list">
            {completedClients.length === 0 ? (
              <div className="task-stat-empty">No converted clients</div>
            ) : (
              completedClients.map(client => {
                const { day, date, time } = formatDateTime(client.statusHistory?.[client.statusHistory.length - 1]?.updatedAt || client.createdAt)
                return (
                  <div key={client.id} className="task-stat-item completed">
                    <div className="task-stat-item-title" title={client.clientName}>{client.clientName}</div>
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
            <div className="task-stat-title">Active Clients</div>
            <div className="task-stat-count current">{currentClients.length}</div>
          </div>
          <div className="task-stat-list">
            {currentClients.length === 0 ? (
              <div className="task-stat-empty">No active clients</div>
            ) : (
              currentClients.map(client => {
                const { day, date, time } = formatDateTime(client.createdAt)
                return (
                  <div key={client.id} className="task-stat-item current">
                    <div className="task-stat-item-title" title={client.clientName}>{client.clientName}</div>
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
            <div className="task-stat-title">Canceled/Postponed</div>
            <div className="task-stat-count cancelled">{cancelledClients.length}</div>
          </div>
          <div className="task-stat-list">
            {cancelledClients.length === 0 ? (
              <div className="task-stat-empty">No canceled/postponed clients</div>
            ) : (
              cancelledClients.map(client => {
                const { day, date, time } = formatDateTime(client.statusHistory?.[client.statusHistory.length - 1]?.updatedAt || client.createdAt)
                return (
                  <div key={client.id} className="task-stat-item cancelled">
                    <div className="task-stat-item-title" title={client.clientName}>{client.clientName}</div>
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

export default BDODashboard