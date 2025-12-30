// Nkumbise Investment Dashboard - Proper Role Management
// Single login: admin/admin for all roles

document.addEventListener('DOMContentLoaded', function() {
    console.log('Nkumbise Dashboard loaded');
    initializeDashboard();
});

function initializeDashboard() {
    // Set current date
    updateCurrentDate();
    
    // Auto-fill login for testing
    autoFillLogin();
    
    // Check if already logged in
    checkExistingSession();
    
    // Initialize event listeners
    setupEventListeners();
}

function updateCurrentDate() {
    const now = new Date();
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function autoFillLogin() {
    // Auto-fill for easy testing
    setTimeout(() => {
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField && passwordField) {
            usernameField.value = 'admin';
            passwordField.value = 'admin';
        }
    }, 500);
}

function setupEventListeners() {
    // Role selection
    document.querySelectorAll('.role-option').forEach(option => {
        option.addEventListener('click', function() {
            selectRole(this.dataset.role);
        });
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            login();
        });
    }
    
    // Quick action buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('action-btn')) {
            const view = e.target.dataset.view;
            if (view) showView(view);
        }
    });
}

function selectRole(role) {
    console.log('Role selected:', role);
    
    // Remove active class from all role options
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected role
    event.target.classList.add('active');
    
    // Store selected role
    window.selectedRole = role;
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    // Reset error
    if (errorElement) errorElement.style.display = 'none';
    
    // Simple validation
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Get selected role
    const activeRoleButton = document.querySelector('.role-option.active');
    if (!activeRoleButton) {
        showError('Please select a role');
        return;
    }
    
    const selectedRole = activeRoleButton.dataset.role;
    
    // SINGLE LOGIN: admin/admin for all roles
    if (username === 'admin' && password === 'admin') {
        // User data based on selected role
        const userData = {
            username: 'admin',
            role: selectedRole,
            name: getRoleName(selectedRole),
            loginTime: new Date().toISOString(),
            permissions: getRolePermissions(selectedRole)
        };
        
        // Store session
        localStorage.setItem('nkumbise_user', JSON.stringify(userData));
        
        // Show dashboard
        showDashboard(userData);
    } else {
        showError('Invalid credentials. Use: admin / admin');
    }
}

function getRoleName(role) {
    const roleNames = {
        'admin': 'System Administrator',
        'partner': 'Field Partner',
        'accountant': 'Finance Accountant',
        'support': 'Customer Support'
    };
    return roleNames[role] || 'User';
}

function getRolePermissions(role) {
    const permissions = {
        'admin': ['all'],
        'partner': ['view_loans', 'add_loans', 'record_payments', 'view_customers'],
        'accountant': ['view_reports', 'export_data', 'view_financials', 'audit'],
        'support': ['view_applications', 'manage_customers', 'follow_ups', 'communications']
    };
    return permissions[role] || [];
}

function showError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        alert(message);
    }
}

function showDashboard(user) {
    console.log('Showing dashboard for role:', user.role);
    
    // Hide login, show dashboard
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Avatar shows first letter
    const avatar = document.getElementById('userAvatar');
    if (avatar) avatar.textContent = user.name.charAt(0);
    
    // Show role-specific menu
    showRoleView(user.role);
    
    // Load dashboard data for role
    loadDashboardData(user.role);
    
    // Update dashboard title
    updateDashboardTitle(user.role);
}

function showRoleView(role) {
    console.log('Showing menu for role:', role);
    
    // Hide all role views
    document.querySelectorAll('.admin-view, .partner-view, .accountant-view, .support-view').forEach(view => {
        view.style.display = 'none';
        view.classList.remove('view-active');
    });
    
    // Show correct role view
    const roleView = document.querySelector(`.${role}-view`);
    if (roleView) {
        roleView.style.display = 'block';
        roleView.classList.add('view-active');
        
        // Show first nav item as active
        const firstNavItem = roleView.querySelector('.nav-item');
        if (firstNavItem) {
            firstNavItem.classList.add('active');
        }
    }
    
    // Also show common menu items
    document.querySelectorAll('.nav-item:not([class*="-view"] .nav-item)').forEach(item => {
        item.style.display = 'flex';
    });
}

function updateDashboardTitle(role) {
    const titles = {
        'admin': 'Administrator Dashboard',
        'partner': 'Partner Dashboard - Field Operations',
        'accountant': 'Accountant Dashboard - Financial Management',
        'support': 'Support Dashboard - Customer Service'
    };
    
    const titleElement = document.getElementById('dashboardTitle');
    if (titleElement) {
        titleElement.textContent = titles[role] || 'Dashboard';
    }
}

function loadDashboardData(role) {
    console.log('Loading data for role:', role);
    
    // Reset all stats to zero
    const stats = {
        totalLoans: 0,
        totalAmount: 0,
        activeLoans: 0,
        totalProfit: 0
    };
    
    // Update stats with TZS
    updateStats(stats);
    
    // Clear tables
    clearTables();
    
    // Load quick actions for specific role
    loadQuickActions(role);
    
    // Show role-specific content
    showRoleContent(role);
}

function updateStats(stats) {
    const totalAmountElement = document.getElementById('statTotalAmount');
    const totalProfitElement = document.getElementById('statTotalProfit');
    
    if (totalAmountElement) {
        const usdAmount = Math.round(stats.totalAmount / 2500);
        totalAmountElement.innerHTML = `
            TZS ${stats.totalAmount.toLocaleString()}<br>
            <small style="color: #666; font-size: 0.9rem;">≈ $${usdAmount.toLocaleString()} USD</small>
        `;
    }
    
    if (totalProfitElement) {
        const usdProfit = Math.round(stats.totalProfit / 2500);
        totalProfitElement.innerHTML = `
            TZS ${stats.totalProfit.toLocaleString()}<br>
            <small style="color: #666; font-size: 0.9rem;">≈ $${usdProfit.toLocaleString()} USD</small>
        `;
    }
    
    document.getElementById('statTotalLoans').textContent = stats.totalLoans;
    document.getElementById('statActiveLoans').textContent = stats.activeLoans;
}

function clearTables() {
    const loansTable = document.getElementById('loansTable');
    if (loansTable) loansTable.innerHTML = '';
    
    const activityList = document.getElementById('activityList');
    if (activityList) activityList.innerHTML = '';
}

function loadQuickActions(role) {
    const actions = {
        'admin': [
            { text: 'Add New User', icon: 'fa-user-plus', view: 'userManagement' },
            { text: 'System Reports', icon: 'fa-chart-line', view: 'systemReports' },
            { text: 'Settings', icon: 'fa-cog', view: 'settings' },
            { text: 'Backup Data', icon: 'fa-download', view: 'backup' }
        ],
        'partner': [
            { text: 'Add New Loan', icon: 'fa-plus-circle', view: 'addLoan' },
            { text: 'My Loans', icon: 'fa-file-invoice', view: 'myLoans' },
            { text: 'Record Payment', icon: 'fa-money-check', view: 'recordPayment' },
            { text: 'Customers', icon: 'fa-user-friends', view: 'customers' }
        ],
        'accountant': [
            { text: 'Financial Reports', icon: 'fa-chart-pie', view: 'financialReports' },
            { text: 'Profit Analysis', icon: 'fa-calculator', view: 'profitAnalysis' },
            { text: 'Export Data', icon: 'fa-file-export', view: 'exportData' },
            { text: 'Audit Trail', icon: 'fa-clipboard-check', view: 'auditTrail' }
        ],
        'support': [
            { text: 'New Applications', icon: 'fa-inbox', view: 'applications' },
            { text: 'Customer Support', icon: 'fa-headset', view: 'customerSupport' },
            { text: 'Follow-ups', icon: 'fa-bell', view: 'followups' },
            { text: 'Send Message', icon: 'fa-comments', view: 'communications' }
        ]
    };
    
    const quickActionsDiv = document.getElementById('quickActions');
    if (quickActionsDiv) {
        if (actions[role]) {
            quickActionsDiv.innerHTML = actions[role].map(action => `
                <button class="action-btn" data-view="${action.view}" onclick="showView('${action.view}')">
                    <i class="fas ${action.icon}"></i><br>
                    ${action.text}
                </button>
            `).join('');
        } else {
            quickActionsDiv.innerHTML = '<p>No quick actions available for this role.</p>';
        }
    }
}

function showRoleContent(role) {
    const mainContent = document.getElementById('mainContent');
    const mainTitle = document.getElementById('mainContentTitle');
    
    if (!mainContent || !mainTitle) return;
    
    const roleContents = {
        'admin': {
            title: 'System Overview',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-user-shield"></i>
                    </div>
                    <h3 class="empty-state-title">Administrator Dashboard</h3>
                    <p class="empty-state-description">
                        Full system access. Manage users, view all data, configure system settings.
                    </p>
                    <div class="quick-actions" id="adminQuickActions">
                        <button class="action-btn" onclick="showView('userManagement')">
                            <i class="fas fa-users-cog"></i><br>
                            User Management
                        </button>
                        <button class="action-btn" onclick="showView('systemLogs')">
                            <i class="fas fa-clipboard-list"></i><br>
                            System Logs
                        </button>
                        <button class="action-btn" onclick="showView('settings')">
                            <i class="fas fa-cog"></i><br>
                            Settings
                        </button>
                        <button class="action-btn" onclick="showView('backup')">
                            <i class="fas fa-database"></i><br>
                            Backup
                        </button>
                    </div>
                </div>
            `
        },
        'partner': {
            title: 'Field Operations',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-handshake"></i>
                    </div>
                    <h3 class="empty-state-title">Partner Dashboard</h3>
                    <p class="empty-state-description">
                        Manage your loans, record payments, and track customer information.
                    </p>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background: linear-gradient(135deg, #2d5be3, #1a49c4);">
                                    <i class="fas fa-file-invoice-dollar"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">0</div>
                                    <div class="stat-label">My Active Loans</div>
                                </div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background: linear-gradient(135deg, #00d4aa, #00b894);">
                                    <i class="fas fa-money-check-alt"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">TZS 0</div>
                                    <div class="stat-label">Today's Collections</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        'accountant': {
            title: 'Financial Dashboard',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-calculator"></i>
                    </div>
                    <h3 class="empty-state-title">Accountant Dashboard</h3>
                    <p class="empty-state-description">
                        Financial reports, profit analysis, and data export functionality.
                    </p>
                    <div class="currency-summary-box">
                        <div class="currency-summary-title">
                            <i class="fas fa-chart-line"></i>
                            Financial Summary (TZS)
                        </div>
                        <div class="currency-summary-row">
                            <span>Total Loan Portfolio:</span>
                            <strong>TZS 0</strong>
                        </div>
                        <div class="currency-summary-row">
                            <span>Total Profit:</span>
                            <strong>TZS 0</strong>
                        </div>
                        <div class="currency-summary-row">
                            <span>Investor Share (70%):</span>
                            <strong>TZS 0</strong>
                        </div>
                        <div class="currency-summary-row">
                            <span>Partner Share (30%):</span>
                            <strong>TZS 0</strong>
                        </div>
                    </div>
                </div>
            `
        },
        'support': {
            title: 'Customer Service',
            content: `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-headset"></i>
                    </div>
                    <h3 class="empty-state-title">Support Dashboard</h3>
                    <p class="empty-state-description">
                        Manage customer applications, follow-ups, and communications.
                    </p>
                    <div class="stats-cards">
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background: linear-gradient(135deg, #2d5be3, #1a49c4);">
                                    <i class="fas fa-inbox"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">0</div>
                                    <div class="stat-label">Pending Applications</div>
                                </div>
                            </div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-header">
                                <div class="stat-icon" style="background: linear-gradient(135deg, #ff6b6b, #ff5252);">
                                    <i class="fas fa-bell"></i>
                                </div>
                                <div class="stat-content">
                                    <div class="stat-value">0</div>
                                    <div class="stat-label">Today's Follow-ups</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    };
    
    const content = roleContents[role] || {
        title: 'Dashboard',
        content: '<p>Welcome to Nkumbise Investment Dashboard</p>'
    };
    
    mainTitle.textContent = content.title;
    mainContent.innerHTML = content.content;
}

window.showView = function(viewName) {
    console.log('Showing view:', viewName);
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    if (event && event.target.closest('.nav-item')) {
        event.target.closest('.nav-item').classList.add('active');
    }
    
    // Update main content based on view
    const mainContent = document.getElementById('mainContent');
    const mainTitle = document.getElementById('mainContentTitle');
    
    if (mainContent && mainTitle) {
        const viewTitles = {
            'overview': 'Dashboard Overview',
            'userManagement': 'User Management',
            'systemReports': 'System Reports',
            'addLoan': 'Add New Loan',
            'myLoans': 'My Loans',
            'recordPayment': 'Record Payment',
            'financialReports': 'Financial Reports',
            'applications': 'Applications',
            'customerSupport': 'Customer Support'
        };
        
        mainTitle.textContent = viewTitles[viewName] || viewName;
        
        // Show view content with TZS note
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #6c757d;">
                <i class="fas fa-tools" style="font-size: 3rem; margin-bottom: 1rem; color: #e0e0e0;"></i>
                <h3 style="color: #1a1a2e; margin-bottom: 1rem;">${viewTitles[viewName] || viewName}</h3>
                <p>This feature is ready for use. Data will appear here once you start using the system.</p>
                <div style="margin-top: 1.5rem; font-size: 0.9rem; color: #2d5be3; background: rgba(45, 91, 227, 0.1); padding: 1rem; border-radius: 8px;">
                    <i class="fas fa-info-circle"></i> 
                    <strong>Currency:</strong> All amounts in Tanzanian Shillings (TZS) with USD equivalent shown
                </div>
                <button class="action-btn" onclick="showView('overview')" style="margin-top: 1.5rem; background: #2d5be3; color: white; border: none;">
                    <i class="fas fa-arrow-left"></i> Back to Dashboard
                </button>
            </div>
        `;
    }
};

function checkExistingSession() {
    const userData = localStorage.getItem('nkumbise_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 8) {
                showDashboard(user);
            } else {
                localStorage.removeItem('nkumbise_user');
                showError('Session expired. Please login again.');
            }
        } catch (error) {
            localStorage.removeItem('nkumbise_user');
        }
    }
}

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('nkumbise_user');
        location.reload();
    }
};

// Make functions globally available
window.selectRole = selectRole;
window.login = login;
window.showView = showView;
window.logout = logout;
