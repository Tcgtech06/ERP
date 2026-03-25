import { useState, useEffect } from 'react'

function ClientManagementPage({ user, onBack }) {
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    loadClients()
    const interval = setInterval(loadClients, 3000)
    return () => clearInterval(interval)
  }, [])

  const loadClients = () => {
    const savedTasks = localStorage.getItem('tasks')
    if (savedTasks) {
      const allTasks = JSON.parse(savedTasks)
      const uniqueClients = {}
      
      allTasks.forEach(task => {
        if (!uniqueClients[task.clientEmail]) {
          uniqueClients[task.clientEmail] = {
            email: task.clientEmail,
            name: task.clientName,
            tasks: [],
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            inProgressTasks: 0
          }
        }
        
        uniqueClients[task.clientEmail].tasks.push(task)
        uniqueClients[task.clientEmail].totalTasks++
        
        if (task.status === 'completed') uniqueClients[task.clientEmail].completedTasks++
        else if (task.status === 'pending') uniqueClients[task.clientEmail].pendingTasks++
        else if (task.status === 'in_progress') uniqueClients[task.clientEmail].inProgressTasks++
      })
      
      setClients(Object.values(uniqueClients))
    }
  }

  const totalClients = clients.length
  const activeClients = clients.filter(c => c.pendingTasks > 0 || c.inProgressTasks > 0).length
  const completedClients = clients.filter(c => c.completedTasks > 0 && c.pendingTasks === 0 && c.inProgressTasks === 0).length

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
            <h1>Client Management</h1>
            <p>Manage all client accounts and tasks</p>
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
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Total Clients</h3>
          <div className="stat-value">{totalClients}</div>
        </div>
        <div className="stat-card yellow">
          <h3>Active Clients</h3>
          <div className="stat-value">{activeClients}</div>
        </div>
        <div className="stat-card green">
          <h3>Completed Projects</h3>
          <div className="stat-value">{completedClients}</div>
        </div>
      </div>

      <div className="card">
        <h2>All Clients ({clients.length})</h2>
        {clients.length === 0 ? (
          <div className="empty-state">
            <p>No clients found</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {clients.map(client => (
              <div 
                key={client.email} 
                onClick={() => setSelectedClient(client)}
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '50%', 
                    background: 'var(--primary-green)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    marginRight: '12px'
                  }}>
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{client.name}</h3>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{client.email}</p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'var(--bg-secondary)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>{client.totalTasks}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Tasks</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px', background: 'var(--light-green)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--dark-green)' }}>{client.completedTasks}</div>
                    <div style={{ fontSize: '12px', color: 'var(--dark-green)' }}>Completed</div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {client.pendingTasks > 0 && (
                    <span className="status pending" style={{ fontSize: '11px' }}>
                      {client.pendingTasks} Pending
                    </span>
                  )}
                  {client.inProgressTasks > 0 && (
                    <span className="status in_progress" style={{ fontSize: '11px' }}>
                      {client.inProgressTasks} In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedClient && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--light-green) 0%, var(--bg-secondary) 100%)', border: '2px solid var(--primary-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Client Details: {selectedClient.name}</h2>
            <button className="btn-red" onClick={() => setSelectedClient(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Client Information</h4>
                <p><strong>Name:</strong> {selectedClient.name}</p>
                <p><strong>Email:</strong> {selectedClient.email}</p>
                <p><strong>Total Tasks:</strong> {selectedClient.totalTasks}</p>
              </div>
              <div>
                <h4>Task Statistics</h4>
                <p><strong>Completed:</strong> {selectedClient.completedTasks}</p>
                <p><strong>Pending:</strong> {selectedClient.pendingTasks}</p>
                <p><strong>In Progress:</strong> {selectedClient.inProgressTasks}</p>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: '12px' }}>
            <h4 style={{ marginBottom: '16px' }}>Client Tasks ({selectedClient.tasks.length})</h4>
            {selectedClient.tasks.map(task => (
              <div key={task.id} style={{ 
                padding: '16px', 
                marginBottom: '12px', 
                background: 'var(--bg-primary)',
                borderRadius: '8px',
                borderLeft: '4px solid var(--primary-green)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ margin: '0 0 8px 0' }}>{task.title}</h5>
                    <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-secondary)' }}>{task.description}</p>
                    <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                      {task.assignedTo && ` • Assigned to: ${task.assignedTo}`}
                    </p>
                  </div>
                  <div style={{ marginLeft: '16px' }}>
                    <span className={`status ${task.status}`}>{task.status.replace('_', ' ')}</span>
                    <br />
                    <span className={`priority ${task.priority}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                      {task.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClientManagementPage