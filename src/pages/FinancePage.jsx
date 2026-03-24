import { useState, useEffect } from 'react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { 
  subscribeToFinanceSoftwareProjects, 
  subscribeToFinanceDMProjects,
  createFinanceSoftwareProject,
  createFinanceDMProject,
  updateFinanceSoftwareProject,
  updateFinanceDMProject,
  deleteFinanceSoftwareProject,
  deleteFinanceDMProject
} from '../firebase/firestore'

function FinancePage({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('main')
  const [mainAccountView, setMainAccountView] = useState('monthly') // monthly or yearly
  const [softwareProjects, setSoftwareProjects] = useState([])
  const [digitalMarketingProjects, setDigitalMarketingProjects] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [analyticsView, setAnalyticsView] = useState('year') // year, month, day
  const [analyticsFilter, setAnalyticsFilter] = useState('combined') // combined, software, digitalMarketing
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [formData, setFormData] = useState({
    clientName: '',
    companyName: '',
    location: '',
    budget: '',
    expenses: '',
    profit: '',
    serviceType: 'Software',
    maintenanceAmount: '',
    date: new Date().toISOString().split('T')[0],
    endDate: '', // For DM projects
    isActive: true // For DM projects
  })

  useEffect(() => {
    console.log('Finance Page: Setting up Firebase listeners...')
    
    // Subscribe to real-time updates from Firebase
    const unsubscribeSoftware = subscribeToFinanceSoftwareProjects((projects) => {
      console.log('Firebase: Received software projects:', projects.length)
      setSoftwareProjects(projects)
    })

    const unsubscribeDM = subscribeToFinanceDMProjects((projects) => {
      console.log('Firebase: Received DM projects:', projects.length)
      setDigitalMarketingProjects(projects)
    })

    return () => {
      console.log('Finance Page: Cleaning up Firebase listeners')
      unsubscribeSoftware()
      unsubscribeDM()
    }
  }, [])

  const handleAddProject = async (e) => {
    e.preventDefault()
    
    const projectMonth = new Date(formData.date).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    
    const newProject = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      expenses: parseFloat(formData.expenses) || 0,
      profit: parseFloat(formData.profit) || 0,
      maintenanceAmount: parseFloat(formData.maintenanceAmount) || 0,
      createdBy: user.name,
      month: projectMonth
    }

    console.log('Adding project to Firebase:', activeTab, newProject)
    console.log('Project month format:', projectMonth)

    try {
      if (activeTab === 'software') {
        const id = await createFinanceSoftwareProject(newProject)
        console.log('Software project created with ID:', id)
        alert('Software project added successfully!')
      } else if (activeTab === 'digitalMarketing') {
        const id = await createFinanceDMProject(newProject)
        console.log('DM project created with ID:', id)
        alert('Digital Marketing project added successfully!')
      }

      setFormData({
        clientName: '',
        companyName: '',
        location: '',
        budget: '',
        expenses: '',
        profit: '',
        serviceType: 'Software',
        maintenanceAmount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowAddForm(false)
    } catch (error) {
      console.error('Error adding project to Firebase:', error)
      alert(`Failed to add project: ${error.message}`)
    }
  }

  const handleEditProject = (project) => {
    setEditingProject(project)
    setFormData({
      clientName: project.clientName,
      companyName: project.companyName,
      location: project.location,
      budget: project.budget.toString(),
      expenses: project.expenses.toString(),
      profit: project.profit.toString(),
      serviceType: project.serviceType || 'Software',
      maintenanceAmount: project.maintenanceAmount?.toString() || '',
      date: project.date
    })
    setShowEditForm(true)
    setShowAddForm(false)
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    
    const projectMonth = new Date(formData.date).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    
    const updates = {
      ...formData,
      budget: parseFloat(formData.budget) || 0,
      expenses: parseFloat(formData.expenses) || 0,
      profit: parseFloat(formData.profit) || 0,
      maintenanceAmount: parseFloat(formData.maintenanceAmount) || 0,
      month: projectMonth
    }

    console.log('Updating project in Firebase:', activeTab, updates)
    console.log('Updated project month format:', projectMonth)

    try {
      if (activeTab === 'software') {
        await updateFinanceSoftwareProject(editingProject.id, updates)
      } else if (activeTab === 'digitalMarketing') {
        await updateFinanceDMProject(editingProject.id, updates)
      }

      setFormData({
        clientName: '',
        companyName: '',
        location: '',
        budget: '',
        expenses: '',
        profit: '',
        serviceType: 'Software',
        maintenanceAmount: '',
        date: new Date().toISOString().split('T')[0]
      })
      setShowEditForm(false)
      setEditingProject(null)
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project. Please try again.')
    }
  }

  const handleDeleteProject = async (projectId) => {
    if (!confirm('Delete this project?')) return

    try {
      if (activeTab === 'software') {
        await deleteFinanceSoftwareProject(projectId)
      } else if (activeTab === 'digitalMarketing') {
        await deleteFinanceDMProject(projectId)
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  const handleCancelEdit = () => {
    setShowEditForm(false)
    setEditingProject(null)
    setFormData({
      clientName: '',
      companyName: '',
      location: '',
      budget: '',
      expenses: '',
      profit: '',
      serviceType: 'Software',
      maintenanceAmount: '',
      date: new Date().toISOString().split('T')[0]
    })
  }

  const calculateMonthlyStats = () => {
    const currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
    const currentDate = new Date()
    
    console.log('=== MAIN ACCOUNT CALCULATION ===')
    console.log('Current Month:', currentMonth)
    console.log('Total Software Projects:', softwareProjects.length)
    console.log('Total DM Projects (Recurring):', digitalMarketingProjects.length)
    
    // SOFTWARE: Only count projects from current month (one-time revenue)
    const softwareThisMonth = softwareProjects.filter(p => {
      const projectMonth = p.month || new Date(p.date).toLocaleString('en-IN', { month: 'long', year: 'numeric' })
      return projectMonth === currentMonth
    })
    
    // DIGITAL MARKETING: Count ALL active projects (recurring monthly revenue)
    // Only exclude projects that have an endDate in the past
    const activeDMProjects = digitalMarketingProjects.filter(p => {
      if (p.endDate) {
        const endDate = new Date(p.endDate)
        return endDate >= currentDate
      }
      return true // No end date means still active
    })
    
    console.log('Software Projects (This Month):', softwareThisMonth.length)
    console.log('DM Projects (Active/Recurring):', activeDMProjects.length)
    
    // Calculate totals
    const softwareBudget = softwareThisMonth.reduce((sum, p) => sum + (p.budget || 0), 0)
    const dmBudget = activeDMProjects.reduce((sum, p) => sum + (p.budget || 0), 0)
    const totalBudget = softwareBudget + dmBudget
    
    const softwareExpenses = softwareThisMonth.reduce((sum, p) => sum + (p.expenses || 0), 0)
    const dmExpenses = activeDMProjects.reduce((sum, p) => sum + (p.expenses || 0), 0)
    const totalExpenses = softwareExpenses + dmExpenses
    
    const softwareProfit = softwareThisMonth.reduce((sum, p) => sum + (p.profit || 0), 0)
    const dmProfit = activeDMProjects.reduce((sum, p) => sum + (p.profit || 0), 0)
    const totalMaintenance = softwareThisMonth.reduce((sum, p) => sum + (p.maintenanceAmount || 0), 0)
    
    // Total profit includes both departments + maintenance
    const totalProfit = softwareProfit + dmProfit + totalMaintenance
    
    console.log('Software Budget:', softwareBudget, 'DM Budget (Recurring):', dmBudget, 'Total:', totalBudget)
    console.log('Software Expenses:', softwareExpenses, 'DM Expenses:', dmExpenses, 'Total:', totalExpenses)
    console.log('Software Profit:', softwareProfit, 'DM Profit:', dmProfit, 'Maintenance:', totalMaintenance, 'Total:', totalProfit)
    
    // Calculate per day and per week
    const perDayTurnover = totalBudget / 30
    const perWeekTurnover = totalBudget / 4
    const perDayExpenses = totalExpenses / 30
    const perWeekExpenses = totalExpenses / 4
    const perDayProfit = totalProfit / 30
    const perWeekProfit = totalProfit / 4
    
    return {
      turnover: totalBudget,
      expenses: totalExpenses,
      profit: totalProfit,
      maintenance: totalMaintenance,
      projectCount: softwareThisMonth.length + activeDMProjects.length,
      softwareCount: softwareThisMonth.length,
      dmCount: activeDMProjects.length,
      perDayTurnover,
      perWeekTurnover,
      perDayExpenses,
      perWeekExpenses,
      perDayProfit,
      perWeekProfit
    }
  }

  const calculateYearlyStats = () => {
    const currentYear = new Date().getFullYear()
    
    // SOFTWARE: Count all projects from current year
    const softwareThisYear = softwareProjects.filter(p => {
      const projectYear = new Date(p.date).getFullYear()
      return projectYear === currentYear
    })
    
    // DIGITAL MARKETING: Multiply monthly revenue by number of months active in current year
    let dmYearlyBudget = 0
    let dmYearlyExpenses = 0
    let dmYearlyProfit = 0
    
    digitalMarketingProjects.forEach(p => {
      const startDate = new Date(p.date)
      const endDate = p.endDate ? new Date(p.endDate) : new Date()
      
      // Calculate months active in current year
      let monthsActive = 0
      for (let month = 0; month < 12; month++) {
        const checkDate = new Date(currentYear, month, 15)
        if (checkDate >= startDate && checkDate <= endDate) {
          monthsActive++
        }
      }
      
      dmYearlyBudget += (p.budget || 0) * monthsActive
      dmYearlyExpenses += (p.expenses || 0) * monthsActive
      dmYearlyProfit += (p.profit || 0) * monthsActive
    })
    
    const softwareBudget = softwareThisYear.reduce((sum, p) => sum + (p.budget || 0), 0)
    const softwareExpenses = softwareThisYear.reduce((sum, p) => sum + (p.expenses || 0), 0)
    const softwareProfit = softwareThisYear.reduce((sum, p) => sum + (p.profit || 0), 0)
    const totalMaintenance = softwareThisYear.reduce((sum, p) => sum + (p.maintenanceAmount || 0), 0)
    
    const totalBudget = softwareBudget + dmYearlyBudget
    const totalExpenses = softwareExpenses + dmYearlyExpenses
    const totalProfit = softwareProfit + dmYearlyProfit + totalMaintenance
    
    return {
      turnover: totalBudget,
      expenses: totalExpenses,
      profit: totalProfit,
      maintenance: totalMaintenance,
      projectCount: softwareThisYear.length + digitalMarketingProjects.length
    }
  }

  const calculateTabStats = (projects, includeMaintenance = false) => {
    const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0)
    const totalExpenses = projects.reduce((sum, p) => sum + p.expenses, 0)
    let totalProfit = projects.reduce((sum, p) => sum + p.profit, 0)
    
    // For software projects, add maintenance to profit
    if (includeMaintenance) {
      const totalMaintenance = projects.reduce((sum, p) => sum + (p.maintenanceAmount || 0), 0)
      totalProfit += totalMaintenance
    }
    
    // Calculate per day and per week (assuming 30 days per month, 4 weeks per month)
    const perDayTurnover = totalBudget / 30
    const perWeekTurnover = totalBudget / 4
    const perDayExpenses = totalExpenses / 30
    const perWeekExpenses = totalExpenses / 4
    const perDayProfit = totalProfit / 30
    const perWeekProfit = totalProfit / 4
    
    return { 
      totalBudget, 
      totalExpenses, 
      totalProfit,
      perDayTurnover,
      perWeekTurnover,
      perDayExpenses,
      perWeekExpenses,
      perDayProfit,
      perWeekProfit
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const getCurrentProjects = () => {
    if (activeTab === 'software') return softwareProjects
    return digitalMarketingProjects
  }

  const getTabColor = () => {
    if (activeTab === 'main') return '#0EA5E9'
    if (activeTab === 'software') return 'var(--primary-red)'
    return 'var(--primary-yellow)'
  }

  // Analytics Functions
  const getYearlyData = () => {
    let projectsToAnalyze = []
    
    if (analyticsFilter === 'software') {
      projectsToAnalyze = softwareProjects
    } else if (analyticsFilter === 'digitalMarketing') {
      projectsToAnalyze = digitalMarketingProjects
    } else {
      projectsToAnalyze = [...softwareProjects, ...digitalMarketingProjects]
    }
    
    const yearlyData = {}
    
    projectsToAnalyze.forEach(project => {
      const year = new Date(project.date).getFullYear()
      if (!yearlyData[year]) {
        yearlyData[year] = { year, budget: 0, expenses: 0, profit: 0, projects: 0 }
      }
      yearlyData[year].budget += project.budget
      yearlyData[year].expenses += project.expenses
      yearlyData[year].profit += project.profit
      // Add maintenance for software projects
      if (analyticsFilter !== 'digitalMarketing' && project.maintenanceAmount) {
        yearlyData[year].profit += project.maintenanceAmount
      }
      yearlyData[year].projects += 1
    })
    
    return Object.values(yearlyData).sort((a, b) => a.year - b.year)
  }

  const getMonthlyData = () => {
    let projectsToAnalyze = []
    
    if (analyticsFilter === 'software') {
      projectsToAnalyze = softwareProjects
    } else if (analyticsFilter === 'digitalMarketing') {
      projectsToAnalyze = digitalMarketingProjects
    } else {
      projectsToAnalyze = [...softwareProjects, ...digitalMarketingProjects]
    }
    
    const monthlyData = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    projectsToAnalyze.forEach(project => {
      const date = new Date(project.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      
      if (year === selectedYear) {
        const key = months[month]
        if (!monthlyData[key]) {
          monthlyData[key] = { month: key, budget: 0, expenses: 0, profit: 0, projects: 0 }
        }
        monthlyData[key].budget += project.budget
        monthlyData[key].expenses += project.expenses
        monthlyData[key].profit += project.profit
        // Add maintenance for software projects
        if (analyticsFilter !== 'digitalMarketing' && project.maintenanceAmount) {
          monthlyData[key].profit += project.maintenanceAmount
        }
        monthlyData[key].projects += 1
      }
    })
    
    return months.map(m => monthlyData[m] || { month: m, budget: 0, expenses: 0, profit: 0, projects: 0 })
  }

  const getDailyData = () => {
    let projectsToAnalyze = []
    
    if (analyticsFilter === 'software') {
      projectsToAnalyze = softwareProjects
    } else if (analyticsFilter === 'digitalMarketing') {
      projectsToAnalyze = digitalMarketingProjects
    } else {
      projectsToAnalyze = [...softwareProjects, ...digitalMarketingProjects]
    }
    
    const dailyData = {}
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate()
    
    projectsToAnalyze.forEach(project => {
      const date = new Date(project.date)
      const year = date.getFullYear()
      const month = date.getMonth()
      const day = date.getDate()
      
      if (year === selectedYear && month === selectedMonth) {
        const key = day
        if (!dailyData[key]) {
          dailyData[key] = { day: `Day ${day}`, budget: 0, expenses: 0, profit: 0, projects: 0 }
        }
        dailyData[key].budget += project.budget
        dailyData[key].expenses += project.expenses
        dailyData[key].profit += project.profit
        // Add maintenance for software projects
        if (analyticsFilter !== 'digitalMarketing' && project.maintenanceAmount) {
          dailyData[key].profit += project.maintenanceAmount
        }
        dailyData[key].projects += 1
      }
    })
    
    const result = []
    for (let i = 1; i <= daysInMonth; i++) {
      result.push(dailyData[i] || { day: `Day ${i}`, budget: 0, expenses: 0, profit: 0, projects: 0 })
    }
    return result
  }

  const getDepartmentData = () => {
    const softwareStats = calculateTabStats(softwareProjects, true) // Include maintenance for software
    const dmStats = calculateTabStats(digitalMarketingProjects, false)
    
    return [
      { name: 'Software', value: softwareStats.totalProfit, projects: softwareProjects.length },
      { name: 'Digital Marketing', value: dmStats.totalProfit, projects: digitalMarketingProjects.length }
    ]
  }

  const getAnalyticsData = () => {
    if (analyticsView === 'year') return getYearlyData()
    if (analyticsView === 'month') return getMonthlyData()
    return getDailyData()
  }

  const COLORS = ['#EF4444', '#F59E0B']

  const currentProjects = getCurrentProjects()
  const monthlyStats = calculateMonthlyStats()
  const yearlyStats = calculateYearlyStats()
  const displayStats = mainAccountView === 'monthly' ? monthlyStats : yearlyStats
  const currentMonth = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })
  const currentYear = new Date().getFullYear()

  return (
    <div className="container">
      <div className="header">
        <div className="header-content">
          <img src="/Images/logo.png" alt="Logo" className="logo" onError={(e) => e.target.style.display = 'none'} />
          <div>
            <h1>Finance Management</h1>
            <p>Manage company accounts and project finances</p>
          </div>
        </div>
        <div className="header-actions">
          <button onClick={onBack} className="btn-red">Back to Dashboard</button>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('main')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'main' ? '#0EA5E9' : 'transparent',
              color: activeTab === 'main' ? 'white' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'main' ? '3px solid #0EA5E9' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            Main Account Overview
          </button>
          <button
            onClick={() => setActiveTab('software')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'software' ? 'var(--primary-red)' : 'transparent',
              color: activeTab === 'software' ? 'white' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'software' ? '3px solid var(--primary-red)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            Software Projects
          </button>
          <button
            onClick={() => setActiveTab('digitalMarketing')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'digitalMarketing' ? 'var(--primary-yellow)' : 'transparent',
              color: activeTab === 'digitalMarketing' ? 'var(--dark-yellow)' : 'var(--text-primary)',
              border: 'none',
              borderBottom: activeTab === 'digitalMarketing' ? '3px solid var(--primary-yellow)' : '3px solid transparent',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              borderRadius: '8px 8px 0 0'
            }}
          >
            Digital Marketing Projects
          </button>
        </div>

        {activeTab === 'main' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <h2>Company Overview - {mainAccountView === 'monthly' ? currentMonth : currentYear}</h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMainAccountView('monthly')}
                  style={{
                    padding: '8px 16px',
                    background: mainAccountView === 'monthly' ? '#0EA5E9' : 'var(--bg-primary)',
                    color: mainAccountView === 'monthly' ? 'white' : 'var(--text-primary)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Monthly View
                </button>
                <button
                  onClick={() => setMainAccountView('yearly')}
                  style={{
                    padding: '8px 16px',
                    background: mainAccountView === 'yearly' ? '#0EA5E9' : 'var(--bg-primary)',
                    color: mainAccountView === 'yearly' ? 'white' : 'var(--text-primary)',
                    border: '1px solid #0EA5E9',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '14px'
                  }}
                >
                  Yearly View
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #DBEAFE 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid #0EA5E9'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {mainAccountView === 'monthly' ? 'Monthly' : 'Yearly'} Turnover
                </p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#0EA5E9' }}>
                  {formatCurrency(displayStats.turnover)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  {displayStats.projectCount} Projects
                  {mainAccountView === 'monthly' && ` (${monthlyStats.softwareCount} SW + ${monthlyStats.dmCount} DM)`}
                </p>
                {mainAccountView === 'monthly' && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Day: {formatCurrency(monthlyStats.perDayTurnover)}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Week: {formatCurrency(monthlyStats.perWeekTurnover)}
                    </p>
                  </div>
                )}
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #FEE2E2 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-red)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Expenses</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                  {formatCurrency(displayStats.expenses)}
                </p>
                {mainAccountView === 'monthly' && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Day: {formatCurrency(monthlyStats.perDayExpenses)}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Week: {formatCurrency(monthlyStats.perWeekExpenses)}
                    </p>
                  </div>
                )}
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #D1FAE5 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-green)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Net Profit</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                  {formatCurrency(displayStats.profit)}
                </p>
                {mainAccountView === 'monthly' && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Day: {formatCurrency(monthlyStats.perDayProfit)}
                    </p>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      Per Week: {formatCurrency(monthlyStats.perWeekProfit)}
                    </p>
                  </div>
                )}
              </div>
              <div style={{
                padding: '24px',
                background: 'linear-gradient(135deg, #FEF3C7 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-yellow)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Maintenance Revenue</p>
                <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--dark-yellow)' }}>
                  {formatCurrency(displayStats.maintenance)}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                  Included in Net Profit
                </p>
              </div>
            </div>

            {/* Analytics Section */}
            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '2px solid #0EA5E9', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h3>Financial Analytics</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setAnalyticsView('year')}
                    style={{
                      padding: '8px 16px',
                      background: analyticsView === 'year' ? '#0EA5E9' : 'var(--bg-primary)',
                      color: analyticsView === 'year' ? 'white' : 'var(--text-primary)',
                      border: '1px solid #0EA5E9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Yearly
                  </button>
                  <button
                    onClick={() => setAnalyticsView('month')}
                    style={{
                      padding: '8px 16px',
                      background: analyticsView === 'month' ? '#0EA5E9' : 'var(--bg-primary)',
                      color: analyticsView === 'month' ? 'white' : 'var(--text-primary)',
                      border: '1px solid #0EA5E9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setAnalyticsView('day')}
                    style={{
                      padding: '8px 16px',
                      background: analyticsView === 'day' ? '#0EA5E9' : 'var(--bg-primary)',
                      color: analyticsView === 'day' ? 'white' : 'var(--text-primary)',
                      border: '1px solid #0EA5E9',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '14px'
                    }}
                  >
                    Daily
                  </button>
                </div>
              </div>

              {/* Department Filter */}
              <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', marginRight: '8px', alignSelf: 'center' }}>Filter by:</span>
                <button
                  onClick={() => setAnalyticsFilter('combined')}
                  style={{
                    padding: '6px 14px',
                    background: analyticsFilter === 'combined' ? '#10B981' : 'var(--bg-primary)',
                    color: analyticsFilter === 'combined' ? 'white' : 'var(--text-primary)',
                    border: '1px solid #10B981',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Combined
                </button>
                <button
                  onClick={() => setAnalyticsFilter('software')}
                  style={{
                    padding: '6px 14px',
                    background: analyticsFilter === 'software' ? 'var(--primary-red)' : 'var(--bg-primary)',
                    color: analyticsFilter === 'software' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--primary-red)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Software Only
                </button>
                <button
                  onClick={() => setAnalyticsFilter('digitalMarketing')}
                  style={{
                    padding: '6px 14px',
                    background: analyticsFilter === 'digitalMarketing' ? 'var(--dark-yellow)' : 'var(--bg-primary)',
                    color: analyticsFilter === 'digitalMarketing' ? 'white' : 'var(--text-primary)',
                    border: '1px solid var(--dark-yellow)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  Digital Marketing Only
                </button>
              </div>

              {/* Date Filters */}
              {analyticsView === 'month' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '14px', marginRight: '8px' }}>Select Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  >
                    {[...Array(5)].map((_, i) => {
                      const year = new Date().getFullYear() - 2 + i
                      return <option key={year} value={year}>{year}</option>
                    })}
                  </select>
                </div>
              )}

              {analyticsView === 'day' && (
                <div style={{ marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <label style={{ fontSize: '14px', marginRight: '8px' }}>Year:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                      {[...Array(5)].map((_, i) => {
                        const year = new Date().getFullYear() - 2 + i
                        return <option key={year} value={year}>{year}</option>
                      })}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '14px', marginRight: '8px' }}>Month:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                      style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month, idx) => (
                        <option key={idx} value={idx}>{month}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Line Chart - Revenue Trend */}
              <div style={{ marginBottom: '32px' }}>
                <h4 style={{ marginBottom: '16px' }}>Revenue Trend</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={getAnalyticsData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={analyticsView === 'year' ? 'year' : analyticsView === 'month' ? 'month' : 'day'} />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Line type="monotone" dataKey="budget" stroke="#0EA5E9" strokeWidth={2} name="Budget" />
                    <Line type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} name="Expenses" />
                    <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} name="Profit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart - Department Distribution */}
              <div>
                <h4 style={{ marginBottom: '16px' }}>Department Profit Distribution</h4>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={getDepartmentData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getDepartmentData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div>
                    {getDepartmentData().map((dept, index) => (
                      <div key={dept.name} style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '16px', height: '16px', background: COLORS[index], borderRadius: '4px' }}></div>
                          <strong>{dept.name}</strong>
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '24px' }}>
                          Profit: {formatCurrency(dept.value)}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: '24px' }}>
                          {dept.projects} Projects
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '12px', border: '2px solid #0EA5E9' }}>
              <h3 style={{ marginBottom: '16px' }}>Department Breakdown</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--primary-red)' }}>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Software Department</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{softwareProjects.length} Total Projects</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                      {formatCurrency(calculateTabStats(softwareProjects, true).totalProfit)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Profit</p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-primary)', borderRadius: '8px', borderLeft: '4px solid var(--primary-yellow)' }}>
                  <div>
                    <h4 style={{ marginBottom: '4px' }}>Digital Marketing Department</h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{digitalMarketingProjects.length} Total Projects</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--dark-yellow)' }}>
                      {formatCurrency(calculateTabStats(digitalMarketingProjects, false).totalProfit)}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Profit</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === 'software' || activeTab === 'digitalMarketing') && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <button 
                  className="btn-green" 
                  onClick={() => {
                    setShowAddForm(!showAddForm)
                    setShowEditForm(false)
                    setEditingProject(null)
                  }}
                >
                  {showAddForm ? 'Cancel' : '+ Add New Project'}
                </button>
                {showEditForm && (
                  <button 
                    className="btn-red" 
                    onClick={handleCancelEdit}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              {showAddForm && (
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '24px', 
                  borderRadius: '12px',
                  border: `2px solid ${getTabColor()}`
                }}>
                  <h3 style={{ marginBottom: '20px' }}>Add New {activeTab === 'software' ? 'Software' : 'Digital Marketing'} Project</h3>
                  <form onSubmit={handleAddProject}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label>Client Name *</label>
                        <input
                          type="text"
                          placeholder="Enter client name"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Project Date *</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      {activeTab === 'software' && (
                        <div className="form-group">
                          <label>Service Type *</label>
                          <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                            required
                          >
                            <option value="Software">Software</option>
                            <option value="App">Mobile App</option>
                            <option value="Website">Website</option>
                            <option value="System Software">System Software</option>
                            <option value="AI">AI Solution</option>
                          </select>
                        </div>
                      )}
                      <div className="form-group">
                        <label>Budget (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Expenses (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.expenses}
                          onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Profit (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.profit}
                          onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                          required
                        />
                      </div>
                      {activeTab === 'software' && (
                        <div className="form-group">
                          <label>Maintenance Amount (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.maintenanceAmount}
                            onChange={(e) => setFormData({ ...formData, maintenanceAmount: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn-green" style={{ marginTop: '16px' }}>Add Project</button>
                  </form>
                </div>
              )}

              {showEditForm && (
                <div style={{ 
                  background: 'var(--bg-secondary)', 
                  padding: '24px', 
                  borderRadius: '12px',
                  border: `2px solid #F59E0B`
                }}>
                  <h3 style={{ marginBottom: '20px' }}>Edit {activeTab === 'software' ? 'Software' : 'Digital Marketing'} Project</h3>
                  <form onSubmit={handleUpdateProject}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                      <div className="form-group">
                        <label>Client Name *</label>
                        <input
                          type="text"
                          placeholder="Enter client name"
                          value={formData.clientName}
                          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Company Name *</label>
                        <input
                          type="text"
                          placeholder="Enter company name"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Location *</label>
                        <input
                          type="text"
                          placeholder="City, State"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Project Date *</label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          required
                        />
                      </div>
                      {activeTab === 'software' && (
                        <div className="form-group">
                          <label>Service Type *</label>
                          <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                            required
                          >
                            <option value="Software">Software</option>
                            <option value="App">Mobile App</option>
                            <option value="Website">Website</option>
                            <option value="System Software">System Software</option>
                            <option value="AI">AI Solution</option>
                          </select>
                        </div>
                      )}
                      <div className="form-group">
                        <label>Budget (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.budget}
                          onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Expenses (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.expenses}
                          onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Profit (₹) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={formData.profit}
                          onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                          required
                        />
                      </div>
                      {activeTab === 'software' && (
                        <div className="form-group">
                          <label>Maintenance Amount (₹)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={formData.maintenanceAmount}
                            onChange={(e) => setFormData({ ...formData, maintenanceAmount: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                    <button type="submit" className="btn-yellow" style={{ marginTop: '16px' }}>Update Project</button>
                  </form>
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #DBEAFE 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: `2px solid ${getTabColor()}`
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Budget</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: getTabColor() }}>
                  {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').totalBudget)}
                </p>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Day: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perDayTurnover)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Week: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perWeekTurnover)}
                  </p>
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #FEE2E2 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-red)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Expenses</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                  {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').totalExpenses)}
                </p>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Day: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perDayExpenses)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Week: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perWeekExpenses)}
                  </p>
                </div>
              </div>
              <div style={{
                padding: '20px',
                background: 'linear-gradient(135deg, #D1FAE5 0%, var(--bg-secondary) 100%)',
                borderRadius: '12px',
                border: '2px solid var(--primary-green)'
              }}>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Profit{activeTab === 'software' ? ' (incl. Maintenance)' : ''}</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                  {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').totalProfit)}
                </p>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Day: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perDayProfit)}
                  </p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Per Week: {formatCurrency(calculateTabStats(currentProjects, activeTab === 'software').perWeekProfit)}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 style={{ marginBottom: '20px' }}>
                {activeTab === 'software' ? 'Software Projects' : 'Digital Marketing Projects'}
                <span style={{ fontSize: '16px', fontWeight: 'normal', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                  ({currentProjects.length} projects)
                </span>
              </h2>
              
              {currentProjects.length === 0 ? (
                <div className="empty-state">
                  <p>No projects found</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                    Click "Add New Project" to create your first project
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {currentProjects.sort((a, b) => new Date(b.date) - new Date(a.date)).map((project) => (
                    <div key={project.id} style={{
                      padding: '24px',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      borderLeft: `4px solid ${getTabColor()}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px', marginBottom: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h3 style={{ margin: 0 }}>{project.companyName}</h3>
                            {activeTab === 'software' && (
                              <span style={{
                                padding: '4px 12px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: '600',
                                background: 'var(--light-red)',
                                color: 'var(--primary-red)'
                              }}>
                                {project.serviceType}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            👤 Client: {project.clientName}
                          </p>
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            📍 Location: {project.location}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            📅 {new Date(project.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • Added by {project.createdBy}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-yellow" 
                            onClick={() => handleEditProject(project)}
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn-red" 
                            onClick={() => handleDeleteProject(project.id)}
                            style={{ padding: '8px 16px', fontSize: '14px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Budget</p>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#0EA5E9' }}>
                            {formatCurrency(project.budget)}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Expenses</p>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-red)' }}>
                            {formatCurrency(project.expenses)}
                          </p>
                        </div>
                        <div>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Profit</p>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary-green)' }}>
                            {formatCurrency(project.profit)}
                          </p>
                        </div>
                        {activeTab === 'software' && project.maintenanceAmount > 0 && (
                          <div>
                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Maintenance</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--dark-yellow)' }}>
                              {formatCurrency(project.maintenanceAmount)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FinancePage
