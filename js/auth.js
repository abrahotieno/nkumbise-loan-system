// Simple Dashboard Authentication
let selectedRole = 'admin';

function selectRole(role) {
    selectedRole = role;
    
    // Remove active class from all role options
    document.querySelectorAll('.role-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to selected role
    event.target.closest('.role-option').classList.add('active');
    
    console.log('Selected role:', role);
}

function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    console.log('Login attempt:', { username, password, selectedRole });
    
    // Validate inputs
    if (!username || !password) {
        showError('Please enter both username and password');
        return;
    }
    
    // Demo credentials
    const validLogins = [
        { user: 'admin', pass: 'admin123', role: 'admin', name: 'System Administrator' },
        { user: 'partner', pass: 'partner123', role: 'partner', name: 'Field Partner' },
        { user: 'account', pass: 'account123', role: 'accountant', name: 'Finance Accountant' },
        { user: 'support', pass: 'support123', role: 'support', name: 'Customer Support' }
    ];
    
    // Check credentials
    const isValid = validLogins.find(login => 
        login.user === username && 
        login.pass === password && 
        login.role === selectedRole
    );
    
    if (isValid) {
        // Hide error
        if (errorElement) {
            errorElement.style.display = 'none';
        }
        
        // Store user in localStorage
        localStorage.setItem('nkumbise_user', JSON.stringify({
            username: username,
            role: selectedRole,
            name: isValid.name,
            loginTime: new Date().toISOString()
        }));
        
        // Show dashboard
        showDashboard(isValid);
    } else {
        showError('Invalid login. Try: admin / admin123 with Admin role selected');
    }
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
    
    // Hide login screen
    document.getElementById('loginScreen').style.display = 'none';
    
    // Show dashboard
    document.getElementById('dashboardContainer').style.display = 'block';
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userRole').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Show first letter of name in avatar
    const avatar = document.getElementById('userAvatar');
    if (avatar) {
        avatar.textContent = user.name.charAt(0);
    }
    
    // Set current date
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
    
    // Show role-specific views
    showRoleView(user.role);
    
    // Load dashboard data
    loadDashboardData(user.role);
}

function showRoleView(role) {
    // Hide all role views
    document.querySelectorAll('.admin-view, .partner-view, .accountant-view, .support-view').forEach(view => {
        view.classList.remove('view-active');
    });
    
    // Show the correct role view
    const roleView = document.querySelector(`.${role}-view`);
    if (roleView) {
        roleView.classList.add('view-active');
    }
    
    // Update dashboard title based on role
    const roleTitles = {
        'admin': 'Administrator Dashboard',
        'partner': 'Partner Dashboard',
        'accountant': 'Accountant Dashboard',
        'support': 'Support Dashboard'
    };
    
    const title = document.getElementById('dashboardTitle');
    if (title) {
        title.textContent = roleTitles[role] || 'Dashboard';
    }
}

function loadDashboardData(role) {
    console.log('Loading data for role:', role);
    
    // Sample data
    const stats = {
        totalLoans: 48,
        totalAmount: 75000,
        activeLoans: 12,
        totalProfit: 22500
    };
    
    // Update stats
    document.getElementById('statTotalLoans').textContent = stats.totalLoans;
    document.getElementById('statTotalAmount').textContent = '$' + stats.totalAmount.toLocaleString();
    document.getElementById('statActiveLoans').textContent = stats.activeLoans;
    document.getElementById('statTotalProfit').textContent = '$' + stats.totalProfit.toLocaleString();
    
    // Load sample loans
    loadSampleLoans();
    
    // Load sample activities
    loadSampleActivities();
    
    // Load quick actions based on role
    loadQuickActions(role);
}

function loadSampleLoans() {
    const loans = [
        { id: 'L20241230001', customer: 'John Doe', amount: 1500, status: 'active', dueDate: '2025-01-30' },
        { id: 'L20241230002', customer: 'Maria Kato', amount: 2500, status: 'active', dueDate: '2025-02-28' },
        { id: 'L20241230003', customer: 'Robert Kim', amount: 1000, status: 'overdue', dueDate: '2024-12-25' },
        { id: 'L20241230004', customer: 'Sarah Johnson', amount: 3000, status: 'completed', dueDate: '2024-12-15' }
    ];
    
    const tableBody = document.getElementById('loansTable');
    if (tableBody) {
        tableBody.innerHTML = loans.map(loan => `
            <tr>
                <td>${loan.id}</td>
                <td>${loan.customer}</td>
                <td>$${loan.amount}</td>
                <td>
                    <span class="status-badge ${
                        loan.status === 'active' ? 'badge-success' :
                        loan.status === 'overdue' ? 'badge-danger' :
                        'badge-info'
                    }">
                        ${loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                    </span>
                </td>
                <td>${loan.dueDate}</td>
            </tr>
        `).join('');
    }
}

function loadSampleActivities() {
    const activities = [
        { text: 'New loan application submitted by John Doe', time: '10 minutes ago', icon: 'fa-file-alt' },
        { text: 'Payment of $65 received from Maria Kato', time: '1 hour ago', icon: 'fa-money-check' },
        { text: 'Loan #L20241230003 marked as overdue', time: '2 hours ago', icon: 'fa-exclamation-triangle' },
        { text: 'New partner account created', time: '3 hours ago', icon: 'fa-user-plus' },
        { text: 'System backup completed', time: '5 hours ago', icon: 'fa-database' }
    ];
    
    const activityList = document.getElementById('activityList');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <li class="activity-item">
                <div class="activity-icon">
                    <i class="fas ${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.text}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </li>
        `).join('');
    }
}

function loadQuickActions(role) {
    const actions = {
        'admin': [
            { text: 'Add New User', icon: 'fa-user-plus', view: 'userManagement' },
            { text: 'View Reports', icon: 'fa-chart-line', view: 'investorReports' },
            { text: 'System Settings', icon: 'fa-cog', view: 'systemLogs' },
            { text: 'Export Data', icon: 'fa-download', view: 'exportData' }
        ],
        'partner': [
            { text: 'Add New Loan', icon: 'fa-plus-circle', view: 'addLoan' },
            { text: 'Record Payment', icon: 'fa-money-check-alt', view: 'repayments' },
            { text: 'My Customers', icon: 'fa-users', view: 'myLoans' },
            { text: 'Field Visit', icon: 'fa-map-marker-alt', view: 'partnerReports' }
        ],
        'accountant': [
            { text: 'Profit Report', icon: 'fa-chart-pie', view: 'profitDistribution' },
            { text: 'Export Data', icon: 'fa-file-export', view: 'exportData' },
            { text: 'Audit Log', icon: 'fa-clipboard-check', view: 'auditLog' },
            { text: 'Bank Recon', icon: 'fa-university', view: 'financialReports' }
        ],
        'support': [
            { text: 'New Applications', icon: 'fa-inbox', view: 'applications' },
            { text: 'Customer Calls', icon: 'fa-phone', view: 'customerContacts' },
            { text: 'Follow-ups', icon: 'fa-bell', view: 'followUps' },
            { text: 'Send Message', icon: 'fa-comments', view: 'communications' }
        ]
    };
    
    const quickActionsDiv = document.getElementById('quickActions');
    if (quickActionsDiv && actions[role]) {
        quickActionsDiv.innerHTML = actions[role].map(action => `
            <button class="action-btn" onclick="showView('${action.view}')">
                <i class="fas ${action.icon}"></i><br>
                ${action.text}
            </button>
        `).join('');
    }
}

function showView(viewName) {
    console.log('Showing view:', viewName);
    
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    event.target.closest('.nav-item').classList.add('active');
    
    // Update main content based on view
    const mainContent = document.getElementById('mainContent');
    const mainTitle = document.getElementById('mainContentTitle');
    
    if (mainContent && mainTitle) {
        const viewTitles = {
            'overview': 'Recent Loans',
            'allLoans': 'All Loans',
            'myLoans': 'My Loans',
            'addLoan': 'Add New Loan',
            'repayments': 'Record Repayment',
            'financialReports': 'Financial Reports',
            'applications': 'Loan Applications',
            'customerContacts': 'Customer Contacts'
        };
        
        mainTitle.textContent = viewTitles[viewName] || viewName;
        
        // Show view content
        mainContent.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <i class="fas fa-cogs" style="font-size: 3rem; color: #e0e0e0; margin-bottom: 1rem;"></i>
                <h3>${viewTitles[viewName] || viewName}</h3>
                <p>This view is under development. In a full system, this would show detailed ${viewName} information.</p>
                <button class="action-btn" onclick="showView('overview')" style="margin-top: 1rem;">
                    <i class="fas fa-arrow-left"></i> Back to Overview
                </button>
            </div>
        `;
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('nkumbise_user');
        location.reload();
    }
}

// Check if user is already logged in when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page loaded');
    
    const userData = localStorage.getItem('nkumbise_user');
    
    if (userData) {
        try {
            const user = JSON.parse(userData);
            
            // Check if login is still valid (within 8 hours)
            const loginTime = new Date(user.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff < 8) {
                showDashboard(user);
            } else {
                localStorage.removeItem('nkumbise_user');
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
            localStorage.removeItem('nkumbise_user');
        }
    }
    
    // Auto-fill demo credentials for testing
    setTimeout(() => {
        document.getElementById('username').value = 'admin';
        document.getElementById('password').value = 'admin123';
    }, 500);
});
