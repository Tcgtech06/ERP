import { useState, useEffect } from 'react'

function BDOReportsPage({ user, onBack }) {
  const [bdoClients, setBdoClients] = useState([])
  const [selectedBdoClient, setSelectedBdoClient] = useState(null)
  const [noteText, setNoteText] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadBdoClients()
    const interval = setInterval(loadBdoClients, 3000)
    return () => clearInterval(interval)
  }, [])

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
  }

  const completedClients = bdoClients.filter(c => c.status === 'Converted')
  const currentClients = bdoClients.filter(c => c.status === 'Meeting scheduled' || c.status === 'Enquired')
  const cancelledClients = bdoClients.filter(c => c.status === 'Meeting canceled' || c.status === 'Meeting postponed')

  const statusCounts = {
    scheduled: bdoClients.filter(c => c.status === 'Meeting scheduled').length,
    enquired: bdoClients.filter(c => c.status === 'Enquired').length,
    converted: completedClients.length,
    canceled: bdoClients.filter(c => c.status === 'Meeting canceled').length,
    postponed: bdoClients.filter(c => c.status === 'Meeting postponed').length,
    total: bdoClients.length
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
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>×</button>
        </div>
        <div className="mobile-menu-items">
          <button className="mobile-menu-item" onClick={onBack}>Back to Dashboard</button>
        </div>
      </div>

      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>BDO Reports Management</h1>
            <p>Business Development Officer Reports</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-yellow">Back to Dashboard</button>
        </div>
        <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
          <span>&nbsp;</span>
        </button>
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
        <div className="stat-card" style={{ borderLeftColor: '#8B5CF6' }}>
          <h3>Total Clients</h3>
          <div className="stat-value">{statusCounts.total}</div>
        </div>
      </div>

      <div className="card">
        <h2>All BDO Client Reports ({bdoClients.length})</h2>
        {bdoClients.length === 0 ? (
          <div className="empty-state">
            <p>No BDO client reports available</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {bdoClients.map(client => (
              <div 
                key={client.id} 
                onClick={() => setSelectedBdoClient(client)}
                style={{
                  background: 'var(--bg-primary)',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: '4px solid var(--primary-green)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <h3 style={{ marginBottom: '12px', color: 'var(--text-primary)' }}>{client.clientName}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>BDO:</strong> {client.bdoName}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Location:</strong> {client.clientLocation}
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Company:</strong> {client.companyDetails}
                </p>
                <div style={{ marginTop: '12px' }}>
                  <span className={`status ${client.status.toLowerCase().replace(' ', '_')}`}>
                    {client.status}
                  </span>
                </div>
                {client.notes && client.notes.length > 0 && (
                  <div style={{ marginTop: '12px', padding: '8px', background: 'var(--light-yellow)', borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--dark-yellow)' }}>
                      {client.notes.length} Note(s) • {client.notes.filter(n => !n.seen).length} Unread
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

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '16px' }}>{selectedBdoClient.clientName}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <p><strong>Location:</strong> {selectedBdoClient.clientLocation}</p>
                <p><strong>Company:</strong> {selectedBdoClient.companyDetails}</p>
                <p><strong>BDO:</strong> {selectedBdoClient.bdoName}</p>
              </div>
              <div>
                <p><strong>Meeting:</strong> {selectedBdoClient.meetingDate ? 
                  `${new Date(selectedBdoClient.meetingDate + (selectedBdoClient.meetingTime ? `T${selectedBdoClient.meetingTime}` : '')).toLocaleDateString()}${selectedBdoClient.meetingTime ? ` at ${selectedBdoClient.meetingTime}` : ''}` 
                  : 'Not scheduled'}</p>
                <p><strong>Status:</strong> <span className={`status ${selectedBdoClient.status.toLowerCase().replace(' ', '_')}`}>{selectedBdoClient.status}</span></p>
                <p><strong>Added:</strong> {new Date(selectedBdoClient.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
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
              <h4 style={{ marginBottom: '16px' }}>Notes History ({selectedBdoClient.notes.length})</h4>
              {selectedBdoClient.notes.map(note => (
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

          {selectedBdoClient.statusHistory && selectedBdoClient.statusHistory.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px', marginTop: '20px' }}>
              <h4 style={{ marginBottom: '16px' }}>Status History</h4>
              {selectedBdoClient.statusHistory.map((history, idx) => (
                <div key={idx} className="history-item">
                  <strong>BDO ({selectedBdoClient.bdoName})</strong> updated to <strong>{history.status}</strong>
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

export default BDOReportsPage