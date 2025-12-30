// Nkumbise Loan System - Dashboard Controller
class DashboardController {
    constructor() {
        this.currentUser = null;
        this.currentRole = null;
        this.currentView = 'overview';
        this.data = {
            loans: [],
            applications: [],
            customers: [],
            users: [],
            activities: []
        };
        
        this.initialize();
    }

    // ==================== INITIALIZATION ====================

    async initialize() {
        // Check if user is logged in
        await this.checkAuth();
        
        // Initialize event listeners
        this.setupEventListeners();
        
        // Load initial data
        await this.loadAllData();
        
        // Update UI
        this.updateUI();
        
        // Start auto-refresh
        this.startAutoRefresh();
    }

    async checkAuth() {
        const userStr = sessionStorage.getItem('nkumbise_user');
        
        if (!userStr) {
            // Not logged in, show login screen
            document.getElementById('loginScreen').style.display = 'flex';
            document.getElementById('dashboardContainer').style.display = 'none';
            return false;
        }

        this.currentUser = JSON.parse(userStr);
        this.currentRole = this.currentUser.role;
        
        // Show dashboard
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardContainer').style.display = 'block';
        
        // Update user info
        this.updateUserInfo();
        
        return true;
    }

    // ==================== DATA LOADING ====================

    async loadAllData() {
        try {
            // Show loading state
            this.showLoading(true);
            
            // Load data in parallel
            [this.data.loans, this.data.applications, this.data.customers, this.data.activities] = await Promise.all([
                nkumbiseAPI.getLoans(),
                nkumbiseAPI.getApplications(),
                nkumbiseAPI.getCustomers(),
                nkumbiseAPI.getActivities(10)
            ]);
            
            // Log successful load
            await nkumbiseAPI.logActivity('system', `${this.currentUser.name} loaded dashboard`, this.currentUser.username);
            
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showError('Failed to load data. Working in offline mode.');
        } finally {
            this.showLoading(false);
        }
    }

    // ==================== UI UPDATES ====================

    updateUI() {
        this.updateStatistics();
        this.updateLoansTable();
        this.updateApplicationsTable();
        this.updateActivitiesList();
        this.updateQuickActions();
        this.updateDate();
        this.showRoleView();
    }

    updateStatistics() {
        const stats = this.calculateStatistics();
        
        // Update DOM elements
        document.getElementById('statTotalLoans').textContent = stats.totalLoans;
        document.getElementById('statTotalAmount').textContent = nkumbiseAPI.formatTZS(stats.totalLoanAmount);
        document.getElementById('statActiveLoans').textContent = stats.activeLoans;
        document.getElementById('statTotalProfit').textContent = nkumbiseAPI.formatTZS(stats.totalProfit);
        
        // Update USD equivalents
        document.querySelectorAll('.stat-usd').forEach(span => {
            const parentText = span.previousElementSibling?.textContent || '';
            const tzsMatch = parentText.match(/TZS ([\d,]+)/);
            
            if (tzsMatch) {
                const tzsAmount = parseFloat(tzsMatch[1].replace(/,/g, ''));
                if (!isNaN(tzsAmount)) {
                    span.textContent = `≈ ${nkumbiseAPI.formatUSD(tzsAmount)}`;
                }
            }
        });
    }

    calculateStatistics() {
        const totalLoanAmount = this.data.loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
        const activeLoans = this.data.loans.filter(loan => loan.status === 'active').length;
        const pendingApps = this.data.applications.filter(app => 
            app.status === 'submitted' || app.status === 'pending'
        ).length;
        
        // Calculate profit (example: 70% of total interest)
        const totalInterest = this.data.loans.reduce((sum, loan) => sum + (parseFloat(loan.interest) || 0), 0);
        const totalProfit = totalInterest * 0.7;

        return {
            totalLoans: this.data.loans.length,
            totalLoanAmount: totalLoanAmount,
            activeLoans: activeLoans,
            pendingApplications: pendingApps,
            totalCustomers: this.data.customers.length,
            totalProfit: totalProfit
        };
    }

    updateLoansTable() {
        const tableBody = document.getElementById('loansTable');
        if (!tableBody) return;

        // Filter loans based on role
        let loansToShow = this.data.loans;
        
        if (this.currentRole === 'partner') {
            // Partner only sees their loans
            loansToShow = loansToShow.filter(loan => loan.partner === this.currentUser.username);
        }
        
        // Sort by date (newest first)
        loansToShow.sort((a, b) => new Date(b.created) - new Date(a.created));
        
        // Take only recent 5 loans for overview
        const recentLoans = loansToShow.slice(0, 5);

        if (recentLoans.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 3rem; color: #6c757d;">
                        <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #e0e0e0;"></i>
                        No loans found. Add your first loan to get started.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = recentLoans.map(loan => `
            <tr>
                <td><strong>${loan.id || loan.loanId}</strong></td>
                <td>
                    <div>${loan.customerName || 'Unknown Customer'}</div>
                    <small class="text-muted">${loan.phone || ''}</small>
                </td>
                <td>
                    <div>${nkumbiseAPI.formatTZS(loan.amount)}</div>
                    <small class="text-primary">${nkumbiseAPI.formatUSD(loan.amount)}</small>
                </td>
                <td>
                    <span class="status-badge ${this.getStatusClass(loan.status)}">
                        ${this.formatStatus(loan.status)}
                    </span>
                </td>
                <td>${this.formatDate(loan.dueDate || loan.created)}</td>
            </tr>
        `).join('');
    }

    updateApplicationsTable() {
        // Only show in applications view
        const tableBody = document.getElementById('applicationsTable');
        if (!tableBody) return;

        let appsToShow = this.data.applications;
        
        if (this.currentRole === 'partner') {
            appsToShow = appsToShow.filter(app => app.assignedTo === this.currentUser.username);
        }
        
        if (this.currentRole === 'support') {
            appsToShow = appsToShow.filter(app => app.status === 'submitted');
        }

        if (appsToShow.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: #6c757d;">
                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block; color: #e0e0e0;"></i>
                        No applications found.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = appsToShow.slice(0, 10).map(app => `
            <tr>
                <td><strong>${app.applicationId || app.id}</strong></td>
                <td>${app.fullName || 'Applicant'}</td>
                <td>${nkumbiseAPI.formatTZS(app.loanAmount)}</td>
                <td>${app.loanPurpose || 'Not specified'}</td>
                <td>
                    <span class="status-badge ${this.getStatusClass(app.status)}">
                        ${this.formatStatus(app.status)}
                    </span>
                </td>
                <td>
                    <button class="btn-action view-app" data-id="${app.id}" title="View">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${this.currentRole === 'partner' || this.currentRole === 'admin' ? `
                    <button class="btn-action approve-app" data-id="${app.id}" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    ` : ''}
                </td>
            </tr>
        `).join('');

        // Add event listeners to action buttons
        this.setupTableActions();
    }

    updateActivitiesList() {
        const activityList = document.getElementById('activityList');
        if (!activityList) return;

        if (this.data.activities.length === 0) {
            activityList.innerHTML = `
                <li class="activity-item">
                    <div class="activity-content">
                        <div class="activity-text">No activities recorded yet</div>
                        <div class="activity-time">System will log activities automatically</div>
                    </div>
                </li>
            `;
            return;
        }

        activityList.innerHTML = this.data.activities.map(activity => `
            <li class="activity-item">
                <div class="activity-icon ${this.getActivityIconClass(activity.type)}">
                    <i class="fas fa-${this.getActivityIcon(activity.type)}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-text">${activity.message}</div>
                    <div class="activity-time">${this.formatTimeAgo(activity.timestamp)} by ${activity.user}</div>
                </div>
            </li>
        `).join('');
    }

    updateQuickActions() {
        const quickActions = document.getElementById('quickActions');
        if (!quickActions) return;

        const actions = this.getRoleQuickActions();
        
        quickActions.innerHTML = actions.map(action => `
            <button class="action-btn" onclick="${action.onclick}">
                <i class="fas fa-${action.icon}"></i>
                ${action.label}
            </button>
        `).join('');
    }

    getRoleQuickActions() {
        const baseActions = [
            {
                icon: 'sync-alt',
                label: 'Refresh Data',
                onclick: 'dashboard.refreshData()'
            },
            {
                icon: 'download',
                label: 'Export Report',
                onclick: 'dashboard.exportReport()'
            }
        ];

        switch(this.currentRole) {
            case 'partner':
                return [
                    {
                        icon: 'plus-circle',
                        label: 'Add New Loan',
                        onclick: "showView('addLoan')"
                    },
                    {
                        icon: 'user-plus',
                        label: 'Add Customer',
                        onclick: "showView('addCustomer')"
                    },
                    ...baseActions
                ];

            case 'accountant':
                return [
                    {
                        icon: 'receipt',
                        label: 'Process Payments',
                        onclick: "showView('payments')"
                    },
                    {
                        icon: 'chart-line',
                        label: 'Financial Report',
                        onclick: "showView('financialReport')"
                    },
                    ...baseActions
                ];

            case 'support':
                return [
                    {
                        icon: 'inbox',
                        label: 'Check Applications',
                        onclick: "showView('applications')"
                    },
                    {
                        icon: 'headset',
                        label: 'Customer Support',
                        onclick: "showView('support')"
                    },
                    ...baseActions
                ];

            case 'admin':
                return [
                    {
                        icon: 'users-cog',
                        label: 'Manage Users',
                        onclick: "showView('users')"
                    },
                    {
                        icon: 'cog',
                        label: 'System Settings',
                        onclick: "showView('settings')"
                    },
                    ...baseActions
                ];

            default:
                return baseActions;
        }
    }

    updateUserInfo() {
        if (!this.currentUser) return;

        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userRole').textContent = this.formatRole(this.currentUser.role);
        document.getElementById('userAvatar').textContent = this.currentUser.name.charAt(0).toUpperCase();
        document.getElementById('dashboardTitle').textContent = `${this.formatRole(this.currentUser.role)} Dashboard`;
    }

    updateDate() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('currentDate').textContent = now.toLocaleDateString('en-TZ', options);
    }

    // ==================== VIEW MANAGEMENT ====================

    showRoleView() {
        // Hide all role views
        document.querySelectorAll('.admin-view, .partner-view, .accountant-view, .support-view').forEach(el => {
            el.classList.remove('view-active');
        });

        // Show current role's view
        const roleView = document.querySelector(`.${this.currentRole}-view`);
        if (roleView) {
            roleView.classList.add('view-active');
        }

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Activate current view
        const currentNav = document.querySelector(`.nav-item[onclick*="${this.currentView}"]`);
        if (currentNav) {
            currentNav.classList.add('active');
        }
    }

    async showView(viewName) {
        this.currentView = viewName;
        
        // Update title
        const titles = {
            'overview': 'Dashboard Overview',
            'addLoan': 'Add New Loan',
            'myLoans': 'My Loans',
            'applications': 'Loan Applications',
            'customers': 'Customer Management',
            'users': 'User Management',
            'reports': 'System Reports',
            'settings': 'System Settings',
            'profile': 'My Profile'
        };
        
        document.getElementById('dashboardTitle').textContent = titles[viewName] || viewName;
        
        // Show the appropriate content
        this.showViewContent(viewName);
        
        // Update navigation
        this.showRoleView();
    }

    showViewContent(viewName) {
        // Hide all views
        document.querySelectorAll('[id$="View"]').forEach(el => {
            el.style.display = 'none';
        });

        // Show requested view
        const viewElement = document.getElementById(`${viewName}View`);
        if (viewElement) {
            viewElement.style.display = 'block';
            
            // Load view-specific data
            this.loadViewData(viewName);
        } else {
            // Show overview as fallback
            this.showViewContent('overview');
        }
    }

    async loadViewData(viewName) {
        switch(viewName) {
            case 'applications':
                await this.loadApplicationsData();
                break;
            case 'customers':
                await this.loadCustomersData();
                break;
            case 'myLoans':
                await this.loadMyLoansData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
        }
    }

    // ==================== DATA OPERATIONS ====================

    async addNewLoan(loanData) {
        try {
            // Add TZS currency and partner info
            const completeLoanData = {
                ...loanData,
                partner: this.currentUser.username,
                partnerName: this.currentUser.name,
                currency: 'TZS',
                exchangeRate: 2500
            };

            const result = await nkumbiseAPI.addLoan(completeLoanData);
            
            if (result) {
                // Refresh data
                await this.loadAllData();
                this.updateUI();
                
                // Log activity
                await nkumbiseAPI.logActivity(
                    'loan',
                    `Added new loan for ${loanData.customerName} - ${nkumbiseAPI.formatTZS(loanData.amount)}`,
                    this.currentUser.username
                );
                
                this.showSuccess('Loan added successfully!');
                this.showView('overview');
                
                return true;
            }
        } catch (error) {
            this.showError('Failed to add loan: ' + error.message);
            return false;
        }
    }

    async addNewApplication(appData) {
        try {
            const result = await nkumbiseAPI.addApplication(appData);
            
            if (result) {
                await this.loadAllData();
                this.updateUI();
                
                await nkumbiseAPI.logActivity(
                    'application',
                    `New application received from ${appData.fullName}`,
                    'system'
                );
                
                this.showSuccess('Application submitted successfully!');
                return true;
            }
        } catch (error) {
            this.showError('Failed to submit application: ' + error.message);
            return false;
        }
    }

    async approveApplication(appId) {
        try {
            const app = this.data.applications.find(a => a.id === appId);
            if (!app) {
                throw new Error('Application not found');
            }

            // Convert application to loan
            const loanData = {
                customerName: app.fullName,
                phone: app.phone,
                amount: app.loanAmount,
                purpose: app.loanPurpose,
                term: app.loanTerm,
                interestRate: app.interestRate || 12,
                status: 'approved',
                applicationId: appId
            };

            await this.addNewLoan(loanData);
            
            // Update application status
            await nkumbiseAPI.updateApplication(appId, { 
                status: 'approved',
                approvedBy: this.currentUser.username,
                approvedAt: new Date().toISOString()
            });

            this.showSuccess('Application approved and loan created!');
            
        } catch (error) {
            this.showError('Failed to approve application: ' + error.message);
        }
    }

    // ==================== UTILITY METHODS ====================

    getStatusClass(status) {
        const statusClasses = {
            'pending': 'badge-warning',
            'submitted': 'badge-info',
            'approved': 'badge-success',
            'active': 'badge-success',
            'rejected': 'badge-danger',
            'completed': 'badge-info',
            'default': 'badge-danger'
        };
        
        return statusClasses[status] || statusClasses.default;
    }

    formatStatus(status) {
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    formatRole(role) {
        const roleNames = {
            'admin': 'Administrator',
            'partner': 'Field Partner',
            'accountant': 'Accountant',
            'support': 'Support Staff'
        };
        
        return roleNames[role] || role;
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('en-TZ', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const past = new Date(timestamp);
        const diff = now - past;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        return this.formatDate(timestamp);
    }

    getActivityIcon(type) {
        const icons = {
            'system': 'cog',
            'loan': 'file-invoice-dollar',
            'application': 'file-alt',
            'payment': 'money-check-alt',
            'customer': 'user',
            'user': 'user-cog',
            'security': 'shield-alt',
            'default': 'bell'
        };
        
        return icons[type] || icons.default;
    }

    getActivityIconClass(type) {
        const colors = {
            'system': 'bg-primary',
            'loan': 'bg-success',
            'application': 'bg-info',
            'payment': 'bg-warning',
            'customer': 'bg-secondary',
            'default': 'bg-light'
        };
        
        return `activity-icon ${colors[type] || colors.default}`;
    }

    // ==================== UI HELPERS ====================

    showLoading(show) {
        const loader = document.getElementById('loader') || this.createLoader();
        loader.style.display = show ? 'block' : 'none';
    }

    createLoader() {
        const loader = document.createElement('div');
        loader.id = 'loader';
        loader.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.8); z-index: 9999; display: flex; align-items: center; justify-content: center;">
                <div class="loading" style="width: 50px; height: 50px;"></div>
            </div>
        `;
        document.body.appendChild(loader);
        return loader;
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="position: fixed; top: 20px; right: 20px; padding: 1rem 1.5rem; background: ${type === 'success' ? '#d4edda' : '#f8d7da'}; color: ${type === 'success' ? '#155724' : '#721c24'}; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); z-index: 10000; display: flex; align-items: center; gap: 10px; max-width: 400px;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // ==================== EVENT HANDLERS ====================

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Role selection
        document.querySelectorAll('.role-option').forEach(btn => {
            btn.addEventListener('click', () => this.handleRoleSelect(btn));
        });
        
        // Logout
        document.querySelector('.logout-btn')?.addEventListener('click', () => this.handleLogout());
        
        // Global refresh shortcut (Ctrl + R)
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refreshData();
            }
        });
    }

    setupTableActions() {
        // View application buttons
        document.querySelectorAll('.view-app').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const appId = e.target.closest('button').dataset.id;
                this.viewApplication(appId);
            });
        });
        
        // Approve application buttons
        document.querySelectorAll('.approve-app').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const appId = e.target.closest('button').dataset.id;
                if (confirm('Are you sure you want to approve this application?')) {
                    await this.approveApplication(appId);
                }
            });
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const user = await nkumbiseAPI.authenticate(username, password);
            
            if (user) {
                this.currentUser = user;
                this.currentRole = user.role;
                
                // Store in session
                sessionStorage.setItem('nkumbise_user', JSON.stringify(user));
                
                // Hide login, show dashboard
                document.getElementById('loginScreen').style.display = 'none';
                document.getElementById('dashboardContainer').style.display = 'block';
                
                // Initialize dashboard
                await this.initialize();
                
                // Log login activity
                await nkumbiseAPI.logActivity('security', `${user.name} logged in`, user.username);
                
            } else {
                document.getElementById('loginError').textContent = 'Invalid username or password';
                document.getElementById('loginError').style.display = 'block';
            }
        } catch (error) {
            document.getElementById('loginError').textContent = 'Login failed. Please try again.';
            document.getElementById('loginError').style.display = 'block';
        }
    }

    handleRoleSelect(button) {
        // Update UI
        document.querySelectorAll('.role-option').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');
        
        // Update form placeholder based on role
        const role = button.dataset.role;
        const usernameInput = document.getElementById('username');
        
        const placeholders = {
            'admin': 'Enter admin username',
            'partner': 'Enter partner username',
            'accountant': 'Enter accountant username',
            'support': 'Enter support username'
        };
        
        if (usernameInput && placeholders[role]) {
            usernameInput.placeholder = placeholders[role];
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            sessionStorage.removeItem('nkumbise_user');
            sessionStorage.removeItem('nkumbise_gh_token');
            window.location.reload();
        }
    }

    // ==================== PUBLIC METHODS ====================

    async refreshData() {
        await this.loadAllData();
        this.updateUI();
        this.showSuccess('Data refreshed successfully');
    }

    async exportReport() {
        // Basic export functionality
        const stats = this.calculateStatistics();
        const report = {
            title: `Nkumbise Investment Report - ${new Date().toLocaleDateString()}`,
            generatedBy: this.currentUser.name,
            generatedAt: new Date().toISOString(),
            statistics: stats,
            loansCount: this.data.loans.length,
            applicationsCount: this.data.applications.length,
            customersCount: this.data.customers.length
        };
        
        // Create download link
        const dataStr = JSON.stringify(report, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const link = document.createElement('a');
        link.setAttribute('href', dataUri);
        link.setAttribute('download', `nkumbise-report-${Date.now()}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showSuccess('Report exported successfully');
    }

    startAutoRefresh() {
        // Auto-refresh every 5 minutes
        setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.refreshData();
            }
        }, 300000);
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new DashboardController();
    
    // Make showView function globally available
    window.showView = (viewName) => {
        if (window.dashboard) {
            window.dashboard.showView(viewName);
        }
    };
    
    // Make logout function globally available
    window.logout = () => {
        if (window.dashboard) {
            window.dashboard.handleLogout();
        }
    };
});
