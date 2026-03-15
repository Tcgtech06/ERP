import { useState, useEffect } from 'react'

const mockEmployees = [
  { id: 1, name: 'John Employee', email: 'employee@test.com', specialization: 'Software', status: 'Active' },
  { id: 2, name: 'Jane Worker', email: 'jane@test.com', specialization: 'Digital Marketing', status: 'Active' },
  { id: 3, name: 'Bob Staff', email: 'bob@test.com', specialization: 'Software', status: 'Active' }
]

function EmployeeManagementPage({ user, onBack }) {
  const [employees, setEmployees] = useState(mockEmployees)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    specialization: 'Software',
    status: 'Active'
  })

  const handleAddEmployee = (e) => {
    e.preventDefault()
    const employee = {
      id: Date.now(),
      ...newEmployee
    }
    setEmployees([...employees, employee])
    setNewEmployee({ name: '', email: '', specialization: 'Software', status: 'Active' })
    setShowAddForm(false)
  }

  const handleUpdateStatus = (employeeId, newStatus) => {
    setEmployees(employees.map(emp => 
      emp.id === employeeId ? { ...emp, status: newStatus } : emp
    ))
  }

  const softwareEmployees = employees.filter(emp => emp.specialization === 'Software')
  const marketingEmployees = employees.filter(emp => emp.specialization === 'Digital Marketing')
  const activeEmployees = employees.filter(emp => emp.status === 'Active')

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Employee Management</h1>
            <p>Manage all employees and their specializations</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-yellow">Back to Dashboard</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3B82F6' }}>
          <h3>Total Employees</h3>
          <div className="stat-value">{employees.length}</div>
        </div>
        <div className="stat-card green">
          <h3>Active Employees</h3>
          <div className="stat-value">{activeEmployees.length}</div>
        </div>
        <div className="stat-card red">
          <h3>Software Team</h3>
          <div className="stat-value">{softwareEmployees.length}</div>
        </div>
        <div className="stat-card yellow">
          <h3>Marketing Team</h3>
          <div className="stat-value">{marketingEmployees.length}</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Employee Management</h2>
          <button className="btn-green" onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Employee'}
          </button>
        </div>

        {showAddForm && (
          <div style={{ background: 'var(--bg-primary)', padding: '24px', borderRadius: '12px', marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>Add New Employee</h3>
            <form onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <select 
                  value={newEmployee.specialization} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, specialization: e.target.value })}
                >
                  <option value="Software">Software Development</option>
                  <option value="Digital Marketing">Digital Marketing</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={newEmployee.status} 
                  onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>
              <button type="submit" className="btn-green">Add Employee</button>
            </form>
          </div>
        )}
      </div>

      <div className="card">
        <h2>All Employees ({employees.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {employees.map(employee => (
            <div 
              key={employee.id} 
              onClick={() => setSelectedEmployee(employee)}
              style={{
                background: 'var(--bg-primary)',
                padding: '20px',
                borderRadius: '12px',
                border: '2px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${employee.specialization === 'Software' ? 'var(--primary-red)' : 'var(--primary-yellow)'}`
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: employee.specialization === 'Software' ? 'var(--primary-red)' : 'var(--primary-yellow)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '16px' }}>
                    {employee.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{employee.name}</h3>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{employee.email}</p>
                </div>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <span className={`status ${employee.specialization === 'Software' ? 'in_progress' : 'pending'}`} style={{ fontSize: '12px' }}>
                  {employee.specialization}
                </span>
                <span className={`status ${employee.status.toLowerCase().replace(' ', '_')}`} style={{ fontSize: '12px', marginLeft: '8px' }}>
                  {employee.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button 
                  className="btn-green" 
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdateStatus(employee.id, employee.status === 'Active' ? 'Inactive' : 'Active')
                  }}
                >
                  {employee.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedEmployee && (
        <div className="card" style={{ 
          background: `linear-gradient(135deg, ${selectedEmployee.specialization === 'Software' ? 'var(--light-red)' : 'var(--light-yellow)'} 0%, var(--bg-secondary) 100%)`, 
          border: `2px solid ${selectedEmployee.specialization === 'Software' ? 'var(--primary-red)' : 'var(--primary-yellow)'}`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Employee Details: {selectedEmployee.name}</h2>
            <button className="btn-red" onClick={() => setSelectedEmployee(null)}>Close</button>
          </div>

          <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedEmployee.name}</p>
                <p><strong>Email:</strong> {selectedEmployee.email}</p>
                <p><strong>Employee ID:</strong> EMP-{selectedEmployee.id}</p>
              </div>
              <div>
                <h4>Work Details</h4>
                <p><strong>Specialization:</strong> {selectedEmployee.specialization}</p>
                <p><strong>Status:</strong> {selectedEmployee.status}</p>
                <p><strong>Department:</strong> {selectedEmployee.specialization === 'Software' ? 'Technology' : 'Marketing'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagementPage