// Nkumbise Investment Dashboard Authentication
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
    // Remove active class from all role options
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected role
    event.target.classList.add('active');
    
    // Store selected role
    window.selectedRole = role;
    console.log('Selected role:', role);
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
    
    // SINGLE LOGIN: admin/admin for all roles
    if (username === 'admin' && password === 'admin') {
        const selectedRole = window.selectedRole || 'admin';
        
        // User data
        const userData = {
            username: 'admin',
            role: selectedRole,
            name: getRoleName(selectedRole),
            loginTime: new Date().toISOString()
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
    console.log('Showing dashboard for:', user.name);
    
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
    
    // Load dashboard with zeros
    loadDashboardData(user.role);
}

function showRoleView(role) {
    // Hide all role views
    document.querySelectorAll('.admin-view, .partner-view, .accountant-view, .support-view').forEach(view => {
        view.classList.remove('view-active');
    });
    
    // Show correct role view
    const roleView = document.querySelector(`.${role}-view`);
    if (roleView) roleView.classList.add('view-active');
    
    // Update dashboard title
    const titles = {
        'admin': 'Administrator Dashboard',
        'partner': 'Partner Dashboard',
        'accountant': 'Accountant Dashboard',
        'support': 'Support Dashboard'
    };
    
    const titleElement = document.getElementById('dashboardTitle');
    if (titleElement) {
        titleElement.textContent = titles[role] || 'Dashboard';
    }
}

function loadDashboardData(role) {
    console.log('Loading fresh data for:', role);
    
    // ALL ZEROS - No sample data
    const stats = {
        totalLoans: 0,
        totalAmount: 0,
        activeLoans: 0,
        totalProfit: 0
    };
    
    // Update stats with TZS
    updateStats(stats);
    
    // Empty tables
    clearTables();
    
    // Load quick actions for role
    loadQuickActions(role);
    
    // Show empty state
    showEmptyState();
}

function updateStats(stats) {
    document.getElementById('statTotalLoans').textContent = stats.totalLoans;
    document.getElementById('statTotalAmount').textContent = `TZS ${stats.totalAmount.toLocaleString()}`;
    document.getElementById('statActiveLoans').textContent = stats.activeLoans;
    document.getElementById('statTotalProfit').textContent = `TZS ${stats.totalProfit.toLocaleString()}`;
}

function clearTables() {
    const loansTable = document.getElementById('loansTable');
    if (loansTable) loansTable.innerHTML = '';
    
    const activityList = document.getElementById('activityList');
    if (activityList) activityList.innerHTML = '';
}

function showEmptyState() {
    const mainContent = document.getElementById('mainContent');
    if (mainContent && mainContent.children.length === 0) {
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-color);">
                <i class="fas fa-database" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>No Data Available</h3>
                <p>System is ready. Data will appear here once you start adding loans and applications.</p>
            </div>
        `;
    }
}

function loadQuickActions(role) {
    const actions = {
        'admin': [
            { text: 'View All Users', icon: 'fa-users', view: 'users' },
            { text: 'System Reports', icon: 'fa-chart-line', view: 'reports' },
            { text: 'Settings', icon: 'fa-cog', view: 'settings' },
            { text: 'Backup Data', icon: 'fa-download', view: 'backup' }
        ],
        'partner': [
            { text: 'Add New Loan', icon: 'fa-plus-circle', view: 'addLoan' },
            { text: 'My Loans', icon: 'fa-file-invoice', view: 'myLoans' },
            { text: 'Collections', icon: 'fa-money-check', view: 'collections' },
            { text: 'Customers', icon: 'fa-user-friends', view: 'customers' }
        ],
        'accountant': [
            { text: 'Financial Reports', icon: 'fa-chart-pie', view: 'financialReports' },
            { text: 'Profit Analysis', icon: 'fa-calculator', view: 'profitAnalysis' },
            { text: 'Export Data', icon: 'fa-file-export', view: 'export' },
            { text: 'Audit Trail', icon: 'fa-clipboard-check', view: 'audit' }
        ],
        'support': [
            { text: 'Applications', icon: 'fa-inbox', view: 'applications' },
            { text: 'Customer Support', icon: 'fa-headset', view: 'support' },
            { text: 'Follow-ups', icon: 'fa-bell', view: 'followups' },
            { text: 'Communications', icon: 'fa-comments', view: 'communications' }
        ]
    };
    
    const quickActionsDiv = document.getElementById('quickActions');
    if (quickActionsDiv && actions[role]) {
        quickActionsDiv.innerHTML = actions[role].map(action => `
            <button class="action-btn" data-view="${action.view}">
                <i class="fas ${action.icon}"></i><br>
                ${action.text}
            </button>
        `).join('');
    }
}

function showView(viewName) {
    console.log('Showing view:', viewName);
    
    // Update active nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.closest('.nav-item')?.classList.add('active');
    
    // Update main content
    const mainContent = document.getElementById('mainContent');
    const mainTitle = document.getElementById('mainContentTitle');
    
    if (mainContent && mainTitle) {
        const viewTitles = {
            'overview': 'Dashboard Overview',
            'users': 'User Management',
            'reports': 'System Reports',
            'addLoan': 'Add New Loan',
            'myLoans': 'My Loans',
            'collections': 'Collections',
            'financialReports': 'Financial Reports',
            'applications': 'Applications',
            'support': 'Customer Support'
        };
        
        mainTitle.textContent = viewTitles[viewName] || viewName;
        
        // Show empty state for all views
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray-color);">
                <i class="fas fa-tools" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <h3>${viewTitles[viewName] || viewName}</h3>
                <p>This feature is ready. Data will appear here once the system is in use.</p>
                <button class="action-btn" onclick="showView('overview')" style="margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i> Back to Overview
                </button>
            </div>
        `;
    }
}

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
            }
        } catch (error) {
            localStorage.removeItem('nkumbise_user');
        }
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('nkumbise_user');
        location.reload();
    }
}

// Make functions globally available
window.selectRole = selectRole;
window.login = login;
window.showView = showView;
window.logout = logout;
