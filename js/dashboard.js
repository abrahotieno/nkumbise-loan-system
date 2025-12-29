// Dashboard Functionality for Nkumbise Investment
let currentUser = null;
let currentView = 'welcome';

function initDashboard(user) {
    currentUser = user;
    
    // Load initial statistics
    loadDashboardStats();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load default view based on role
    loadDefaultView();
}

function setupEventListeners() {
    // Update last update time
    setInterval(() => {
        document.getElementById('lastUpdateTime').textContent = 
            new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }, 60000);
}

function loadDefaultView() {
    switch(currentUser.role) {
        case 'admin':
            loadView('admin-overview');
            break;
        case 'partner':
            loadView('partner-dashboard');
            break;
        case 'account':
            loadView('accountant-overview');
            break;
        case 'support':
            loadView('support-dashboard');
            break;
        default:
            showWelcomeScreen();
    }
}

window.loadView = function(viewName) {
    currentView = viewName;
    
    // Hide all views
    document.querySelectorAll('.view-container').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked menu item
    if (event && event.target.closest('.menu-item')) {
        event.target.closest('.menu-item').classList.add('active');
    }
    
    // Update dashboard title
    updateDashboardTitle(viewName);
    
    // Load specific view
    switch(viewName) {
        case 'admin-overview':
            loadAdminOverview();
            break;
        case 'admin-users':
            loadUserManagement();
            break;
        case 'admin-activities':
            loadActivityLog();
            break;
        case 'admin-settings':
            loadSystemSettings();
            break;
        case 'partner-dashboard':
            loadPartnerDashboard();
            break;
        case 'partner-loans':
            loadPartnerLoans();
            break;
        case 'partner-add-loan':
            loadAddLoanForm();
            break;
        case 'partner-repayments':
            loadRepayments();
            break;
        case 'partner-customers':
            loadCustomers();
            break;
        case 'accountant-overview':
            loadAccountantOverview();
            break;
        case 'accountant-reports':
            loadProfitReports();
            break;
        case 'accountant-investors':
            loadInvestorDistribution();
            break;
        case 'accountant-export':
            loadExportData();
            break;
        case 'support-dashboard':
            loadSupportDashboard();
            break;
        case 'support-applications':
            loadSupportApplications();
            break;
        case 'support-customers':
            loadCustomerContacts();
            break;
        case 'support-followups':
            loadFollowUps();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'password-change':
            window.showModal('passwordChangeModal');
            return;
        default:
            showWelcomeScreen();
    }
};

function updateDashboardTitle(viewName) {
    const titles = {
        'admin-overview': 'System Overview',
        'admin-users': 'User Management',
        'admin-activities': 'Activity Log',
        'admin-settings': 'System Settings',
        'partner-dashboard': 'Partner Dashboard',
        'partner-loans': 'Loan Management',
        'partner-add-loan': 'Add New Loan',
        'partner-repayments': 'Repayment Tracking',
        'partner-customers': 'Customer Management',
        'accountant-overview': 'Financial Overview',
        'accountant-reports': 'Profit Reports',
        'accountant-investors': 'Investor Distribution',
        'accountant-export': 'Export Data',
        'support-dashboard': 'Support Dashboard',
        'support-applications': 'Application Management',
        'support-customers': 'Customer Contacts',
        'support-followups': 'Follow-up Tasks',
        'profile': 'My Profile'
    };
    
    const title = titles[viewName] || 'Dashboard';
    document.getElementById('dashboardTitle').querySelector('h2').textContent = title;
}

function showWelcomeScreen() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
            <div class="welcome-content">
                <h1>Welcome to Nkumbise Investment Dashboard</h1>
                <p>Select a menu item to get started</p>
                <div class="welcome-stats">
                    <div class="stat-card">
                        <i class="fas fa-users"></i>
                        <h3 id="totalLoansStat">0</h3>
                        <p>Total Loans</p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3 id="totalAmountStat">$0</h3>
                        <p>Total Loan Amount</p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-chart-line"></i>
                        <h3 id="totalProfitStat">$0</h3>
                        <p>Total Profit</p>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-user-check"></i>
                        <h3 id="activeLoansStat">0</h3>
                        <p>Active Loans</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

async function loadDashboardStats() {
    try {
        // In production, this would fetch from your GitHub data
        // For demo, use sample data
        const stats = {
            totalLoans: 48,
            totalAmount: 75000,
            totalProfit: 22500,
            activeLoans: 12
        };
        
        // Update stats on welcome screen
        document.getElementById('totalLoansStat').textContent = stats.totalLoans;
        document.getElementById('totalAmountStat').textContent = '$' + stats.totalAmount.toLocaleString();
        document.getElementById('totalProfitStat').textContent = '$' + stats.totalProfit.toLocaleString();
        document.getElementById('activeLoansStat').textContent = stats.activeLoans;
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// ===== ADMIN FUNCTIONS =====
function loadAdminOverview() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="view-container active" id="adminOverview">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-icon primary">
                        <i class="fas fa-users"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">4</div>
                        <div class="stat-label">Active Users</div>
                        <div class="stat-change positive">+1 this week</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon success">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">48</div>
                        <div class="stat-label">Total Loans</div>
                        <div class="stat-change positive">+12%</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Pending Applications</div>
                        <div class="stat-change negative">-2 today</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon danger">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">3</div>
                        <div class="stat-label">Overdue Loans</div>
                        <div class="stat-change positive">-1 today</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Activities</h3>
                        <a href="#" onclick="loadView('admin-activities')">View All</a>
                    </div>
                    <div class="card-body">
                        <div class="activity-feed" id="recentActivities">
                            <!-- Activities will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>System Status</h3>
                    </div>
                    <div class="card-body">
                        <div class="system-status-list">
                            <div class="status-item">
                                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                                <span>Database Connection: <strong>Active</strong></span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                                <span>GitHub Sync: <strong>Connected</strong></span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-check-circle" style="color: #28a745;"></i>
                                <span>Web Hosting: <strong>Online</strong></span>
                            </div>
                            <div class="status-item">
                                <i class="fas fa-exclamation-triangle" style="color: #ffc107;"></i>
                                <span>Backup: <strong>Pending</strong></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <h3>Quick Actions</h3>
                </div>
                <div class="card-body">
                    <div class="quick-actions">
                        <a href="#" class="action-button" onclick="loadView('admin-users')">
                            <i class="fas fa-user-plus"></i>
                            <span>Add New User</span>
                        </a>
                        <a href="#" class="action-button" onclick="loadView('admin-settings')">
                            <i class="fas fa-cog"></i>
                            <span>System Settings</span>
                        </a>
                        <a href="#" class="action-button">
                            <i class="fas fa-download"></i>
                            <span>Export Data</span>
                        </a>
                        <a href="#" class="action-button">
                            <i class="fas fa-chart-bar"></i>
                            <span>Generate Report</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadRecentActivities();
}

function loadRecentActivities() {
    const activities = [
        {
            id: 1,
            user: 'partner',
            action: 'Added new loan',
            details: 'Loan #L20241230001 for John Doe',
            time: '10 minutes ago',
            icon: 'fa-plus-circle'
        },
        {
            id: 2,
            user: 'support',
            action: 'Updated application status',
            details: 'APP20241229001 changed to Approved',
            time: '1 hour ago',
            icon: 'fa-check-circle'
        },
        {
            id: 3,
            user: 'account',
            action: 'Recorded payment',
            details: 'Payment of $65 received',
            time: '2 hours ago',
            icon: 'fa-money-check'
        },
        {
            id: 4,
            user: 'admin',
            action: 'System maintenance',
            details: 'Updated user permissions',
            time: '3 hours ago',
            icon: 'fa-tools'
        }
    ];
    
    const container = document.getElementById('recentActivities');
    if (container) {
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.action}</div>
                    <div class="activity-description">${activity.details}</div>
                    <div class="activity-time">
                        <i class="far fa-user"></i> ${activity.user} • ${activity.time}
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// ===== PARTNER FUNCTIONS =====
function loadPartnerDashboard() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="view-container active" id="partnerDashboard">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-icon primary">
                        <i class="fas fa-file-invoice-dollar"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">12</div>
                        <div class="stat-label">My Active Loans</div>
                        <div class="stat-change positive">+3 this week</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon success">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">$18,500</div>
                        <div class="stat-label">Total Amount Managed</div>
                        <div class="stat-change positive">+15%</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">$650</div>
                        <div class="stat-label">Expected Today</div>
                        <div class="stat-change neutral">On track</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon danger">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">2</div>
                        <div class="stat-label">Overdue Loans</div>
                        <div class="stat-change negative">Need follow-up</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Today's Collections</h3>
                        <a href="#" onclick="loadView('partner-repayments')">View All</a>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Customer</th>
                                        <th>Amount Due</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody id="todayCollections">
                                    <!-- Collections will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Quick Add</h3>
                    </div>
                    <div class="card-body">
                        <form id="quickAddForm">
                            <div class="form-group">
                                <label>Customer Name</label>
                                <input type="text" class="form-control" placeholder="Enter customer name">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Loan Amount</label>
                                    <input type="number" class="form-control" placeholder="$">
                                </div>
                                <div class="form-group">
                                    <label>Period (Days)</label>
                                    <select class="form-control">
                                        <option value="30">30 Days</option>
                                        <option value="60">60 Days</option>
                                        <option value="90">90 Days</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Loan
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <a href="#" class="action-button" onclick="loadView('partner-add-loan')">
                    <i class="fas fa-plus-circle"></i>
                    <span>Add New Loan</span>
                </a>
                <a href="#" class="action-button" onclick="loadView('partner-customers')">
                    <i class="fas fa-user-friends"></i>
                    <span>Customer List</span>
                </a>
                <a href="#" class="action-button">
                    <i class="fas fa-phone"></i>
                    <span>Make Calls</span>
                </a>
                <a href="#" class="action-button">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Field Visits</span>
                </a>
            </div>
        </div>
    `;
    
    loadTodayCollections();
}

function loadTodayCollections() {
    const collections = [
        {
            customer: 'John Doe',
            amount: 65,
            dueDate: 'Today',
            status: 'pending',
            contact: '+255123456789'
        },
        {
            customer: 'Maria Kato',
            amount: 66.67,
            dueDate: 'Today',
            status: 'paid',
            contact: '+255987654321'
        },
        {
            customer: 'Robert Kim',
            amount: 50,
            dueDate: 'Today',
            status: 'overdue',
            contact: '+255765432198'
        }
    ];
    
    const container = document.getElementById('todayCollections');
    if (container) {
        container.innerHTML = collections.map(collection => `
            <tr>
                <td>
                    <strong>${collection.customer}</strong><br>
                    <small>${collection.contact}</small>
                </td>
                <td>$${collection.amount}</td>
                <td>
                    <span class="status-badge status-${collection.status}">
                        ${collection.status.charAt(0).toUpperCase() + collection.status.slice(1)}
                    </span>
                </td>
                <td>
                    <button class="btn-small" onclick="markAsPaid('${collection.customer}')">
                        <i class="fas fa-check"></i> Mark Paid
                    </button>
                </td>
            </tr>
        `).join('');
    }
}

// ===== ACCOUNTANT FUNCTIONS =====
function loadAccountantOverview() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="view-container active" id="accountantOverview">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-icon primary">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">$75,000</div>
                        <div class="stat-label">Total Loan Portfolio</div>
                        <div class="stat-change positive">+12.5%</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon success">
                        <i class="fas fa-chart-line"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">$22,500</div>
                        <div class="stat-label">Total Profit</div>
                        <div class="stat-change positive">+8.2%</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon warning">
                        <i class="fas fa-share-alt"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">70/30</div>
                        <div class="stat-label">Investor/Partner Split</div>
                        <div class="stat-change neutral">Stable</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon danger">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">$1,250</div>
                        <div class="stat-label">Outstanding Dues</div>
                        <div class="stat-change negative">-3%</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Monthly Profit Trend</h3>
                    </div>
                    <div class="card-body">
                        <canvas id="profitChart" height="250"></canvas>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Transactions</h3>
                        <a href="#" onclick="loadView('accountant-reports')">View All</a>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Type</th>
                                    </tr>
                                </thead>
                                <tbody id="recentTransactions">
                                    <!-- Transactions will be loaded here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    loadRecentTransactions();
    renderProfitChart();
}

function loadRecentTransactions() {
    const transactions = [
        {
            date: '2024-12-30',
            description: 'Loan disbursement - John Doe',
            amount: 1500,
            type: 'disbursement'
        },
        {
            date: '2024-12-30',
            description: 'Repayment - Maria Kato',
            amount: 66.67,
            type: 'repayment'
        },
        {
            date: '2024-12-29',
            description: 'Partner commission - James',
            amount: 135,
            type: 'commission'
        },
        {
            date: '2024-12-29',
            description: 'Investor distribution',
            amount: 315,
            type: 'distribution'
        }
    ];
    
    const container = document.getElementById('recentTransactions');
    if (container) {
        container.innerHTML = transactions.map(trans => `
            <tr>
                <td>${trans.date}</td>
                <td>${trans.description}</td>
                <td>$${trans.amount}</td>
                <td>
                    <span class="status-badge ${
                        trans.type === 'repayment' ? 'status-active' :
                        trans.type === 'disbursement' ? 'status-pending' :
                        'status-completed'
                    }">
                        ${trans.type.charAt(0).toUpperCase() + trans.type.slice(1)}
                    </span>
                </td>
            </tr>
        `).join('');
    }
}

function renderProfitChart() {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Monthly Profit',
                data: [3200, 4200, 5100, 5800, 6200, 7500],
                borderColor: '#2d5be3',
                backgroundColor: 'rgba(45, 91, 227, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: true
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ===== SUPPORT FUNCTIONS =====
function loadSupportDashboard() {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="view-container active" id="supportDashboard">
            <div class="stats-grid">
                <div class="stat-box">
                    <div class="stat-icon primary">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">8</div>
                        <div class="stat-label">Pending Applications</div>
                        <div class="stat-change positive">-2 today</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon success">
                        <i class="fas fa-headset"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">24</div>
                        <div class="stat-label">Today's Calls</div>
                        <div class="stat-change positive">+40%</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon warning">
                        <i class="fas fa-tasks"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">15</div>
                        <div class="stat-label">Follow-ups</div>
                        <div class="stat-change negative">+3 new</div>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-icon danger">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <div class="stat-content">
                        <div class="stat-value">92%</div>
                        <div class="stat-label">Satisfaction Rate</div>
                        <div class="stat-change positive">+2%</div>
                    </div>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="card">
                    <div class="card-header">
                        <h3>Recent Applications</h3>
                        <a href="#" onclick="loadView('support-applications')">View All</a>
                    </div>
                    <div class="card-body">
                        <div class="application-list" id="recentApplications">
                            <!-- Applications will be loaded here -->
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <h3>Today's Follow-ups</h3>
                        <a href="#" onclick="loadView('support-followups')">View All</a>
                    </div>
                    <div class="card-body">
                        <div class="followup-list" id="todayFollowups">
                            <!-- Follow-ups will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <a href="#" class="action-button" onclick="loadView('support-applications')">
                    <i class="fas fa-file-alt"></i>
                    <span>Review Applications</span>
                </a>
                <a href="#" class="action-button" onclick="loadView('support-customers')">
                    <i class="fas fa-address-book"></i>
                    <span>Customer Contacts</span>
                </a>
                <a href="#" class="action-button">
                    <i class="fas fa-phone"></i>
                    <span>Make Calls</span>
                </a>
                <a href="#" class="action-button">
                    <i class="fas fa-whatsapp"></i>
                    <span>WhatsApp Messages</span>
                </a>
            </div>
        </div>
    `;
    
    loadRecentApplications();
    loadTodayFollowups();
}

function loadRecentApplications() {
    const applications = [
        {
            id: 'APP20241230001',
            name: 'John Doe',
            amount: 1500,
            status: 'review',
            applied: '2 hours ago'
        },
        {
            id: 'APP20241230002',
            name: 'Sarah Johnson',
            amount: 2500,
            status: 'pending',
            applied: '4 hours ago'
        },
        {
            id: 'APP20241230003',
            name: 'Michael Chen',
            amount: 1000,
            status: 'approved',
            applied: '6 hours ago'
        }
    ];
    
    const container = document.getElementById('recentApplications');
    if (container) {
        container.innerHTML = applications.map(app => `
            <div class="application-card">
                <div class="application-header">
                    <div>
                        <strong>${app.name}</strong><br>
                        <small>#${app.id}</small>
                    </div>
                    <span class="status-badge status-${app.status}">
                        ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                </div>
                <div class="application-info">
                    <div class="application-row">
                        <span>Loan Amount</span>
                        <strong>$${app.amount}</strong>
                    </div>
                    <div class="application-row">
                        <span>Applied</span>
                        <span>${app.applied}</span>
                    </div>
                </div>
                <div class="application-actions">
                    <button class="btn-small" onclick="reviewApplication('${app.id}')">
                        <i class="fas fa-eye"></i> Review
                    </button>
                    <button class="btn-small">
                        <i class="fas fa-phone"></i> Call
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ===== HELPER FUNCTIONS =====
function markAsPaid(customerName) {
    if (confirm(`Mark ${customerName}'s payment as received?`)) {
        alert(`Payment marked as received for ${customerName}`);
        // In production, update your GitHub data
    }
}

function reviewApplication(appId) {
    alert(`Reviewing application ${appId}`);
    // In production, load application details
}

// ===== PLACEHOLDER FUNCTIONS =====
function loadUserManagement() { showPlaceholder('User Management'); }
function loadActivityLog() { showPlaceholder('Activity Log'); }
function loadSystemSettings() { showPlaceholder('System Settings'); }
function loadPartnerLoans() { showPlaceholder('Partner Loans'); }
function loadAddLoanForm() { showPlaceholder('Add Loan Form'); }
function loadRepayments() { showPlaceholder('Repayments'); }
function loadCustomers() { showPlaceholder('Customers'); }
function loadProfitReports() { showPlaceholder('Profit Reports'); }
function loadInvestorDistribution() { showPlaceholder('Investor Distribution'); }
function loadExportData() { showPlaceholder('Export Data'); }
function loadSupportApplications() { showPlaceholder('Support Applications'); }
function loadCustomerContacts() { showPlaceholder('Customer Contacts'); }
function loadFollowUps() { showPlaceholder('Follow-ups'); }
function loadProfile() { showPlaceholder('My Profile'); }
function loadTodayFollowups() { /* Implementation similar to others */ }

function showPlaceholder(title) {
    const content = document.getElementById('dashboardContent');
    content.innerHTML = `
        <div class="view-container active">
            <div class="placeholder-content">
                <i class="fas fa-cogs" style="font-size: 4rem; color: #e0e0e0; margin-bottom: 2rem;"></i>
                <h2>${title}</h2>
                <p>This section is under development. In production, this would connect to your GitHub data.</p>
                <div class="placeholder-actions">
                    <button class="btn-primary" onclick="loadView('${currentUser.role}-dashboard')">
                        <i class="fas fa-arrow-left"></i> Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    `;
}
