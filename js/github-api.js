// Nkumbise Loan System - GitHub API Client
class NkumbiseAPI {
    constructor() {
        this.owner = 'abrahotieno';
        this.repo = 'nkumbise-loan-system';
        this.apiCache = new Map();
        this.cacheDuration = 30000; // 30 seconds cache
    }

    // ==================== CORE API METHODS ====================

    // Send request to GitHub Actions API
    async _sendToGitHub(action, dataType, data = null, id = null, operation = 'add') {
        const payload = {
            action: action,
            dataType: dataType,
            data: data,
            id: id,
            operation: operation,
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this._getToken()}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'loan-api-request',
                    client_payload: payload
                })
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`GitHub API error ${response.status}: ${error}`);
            }

            console.log(`GitHub Action triggered for ${action} ${dataType}`);

            // Wait for action to complete and data to update
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clear cache for this data type
            this.apiCache.delete(dataType);

            // Return fresh data
            return await this._getFromGitHubPages(dataType);

        } catch (error) {
            console.error('GitHub API request failed:', error);
            
            // Fallback to localStorage for offline mode
            return this._getFromLocalStorage(dataType);
        }
    }

    // Get data from GitHub Pages (public URL)
    async _getFromGitHubPages(dataType) {
        const cacheKey = `github-${dataType}`;
        const now = Date.now();
        
        // Check cache
        if (this.apiCache.has(cacheKey)) {
            const cached = this.apiCache.get(cacheKey);
            if (now - cached.timestamp < this.cacheDuration) {
                return cached.data;
            }
        }

        try {
            const url = `https://${this.owner}.github.io/${this.repo}/data/${dataType}.json?_=${now}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist yet, return empty array
                    return [];
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the data
            this.apiCache.set(cacheKey, {
                data: data,
                timestamp: now
            });

            // Also update localStorage as backup
            this._saveToLocalStorage(dataType, data);

            return data;

        } catch (error) {
            console.warn(`Failed to fetch ${dataType} from GitHub Pages:`, error);
            
            // Fallback to localStorage
            return this._getFromLocalStorage(dataType);
        }
    }

    // ==================== LOCAL STORAGE HELPERS ====================

    _getFromLocalStorage(dataType) {
        try {
            const data = localStorage.getItem(`nkumbise_${dataType}`);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Failed to get ${dataType} from localStorage:`, error);
            return [];
        }
    }

    _saveToLocalStorage(dataType, data) {
        try {
            localStorage.setItem(`nkumbise_${dataType}`, JSON.stringify(data));
        } catch (error) {
            console.error(`Failed to save ${dataType} to localStorage:`, error);
        }
    }

    // ==================== PUBLIC API METHODS ====================

    // LOAN MANAGEMENT
    async getLoans(filters = {}) {
        const loans = await this._getFromGitHubPages('loans');
        
        if (filters.status) {
            return loans.filter(loan => loan.status === filters.status);
        }
        if (filters.partner) {
            return loans.filter(loan => loan.partner === filters.partner);
        }
        
        return loans;
    }

    async addLoan(loanData) {
        const loanWithMeta = {
            ...loanData,
            currency: 'TZS',
            status: 'pending',
            created: new Date().toISOString(),
            createdBy: this._getCurrentUser() || 'system'
        };

        return await this._sendToGitHub('SAVE_DATA', 'loans', loanWithMeta);
    }

    async updateLoan(loanId, updates) {
        return await this._sendToGitHub('SAVE_DATA', 'loans', updates, loanId, 'update');
    }

    // APPLICATION MANAGEMENT
    async getApplications(filters = {}) {
        const applications = await this._getFromGitHubPages('applications');
        
        if (filters.status) {
            return applications.filter(app => app.status === filters.status);
        }
        
        return applications;
    }

    async addApplication(applicationData) {
        const appWithMeta = {
            ...applicationData,
            currency: 'TZS',
            status: 'submitted',
            created: new Date().toISOString(),
            applicationId: `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
        };

        return await this._sendToGitHub('SAVE_DATA', 'applications', appWithMeta);
    }

    async updateApplication(appId, updates) {
        return await this._sendToGitHub('SAVE_DATA', 'applications', updates, appId, 'update');
    }

    // CUSTOMER MANAGEMENT
    async getCustomers() {
        return await this._getFromGitHubPages('customers');
    }

    async addCustomer(customerData) {
        const customerWithMeta = {
            ...customerData,
            customerId: `CUST-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            created: new Date().toISOString(),
            status: 'active'
        };

        return await this._sendToGitHub('SAVE_DATA', 'customers', customerWithMeta);
    }

    async updateCustomer(customerId, updates) {
        return await this._sendToGitHub('SAVE_DATA', 'customers', updates, customerId, 'update');
    }

    // USER MANAGEMENT
    async getUsers() {
        return await this._getFromGitHubPages('users');
    }

    async authenticate(username, password) {
        const users = await this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store session
            sessionStorage.setItem('nkumbise_user', JSON.stringify({
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                email: user.email
            }));
            
            return user;
        }
        
        return null;
    }

    // ACTIVITY LOG
    async getActivities(limit = 50) {
        const activities = await this._getFromGitHubPages('activities');
        return activities.slice(0, limit);
    }

    async logActivity(type, message, user = null) {
        const activity = {
            type: type,
            message: message,
            user: user || this._getCurrentUser() || 'system',
            timestamp: new Date().toISOString(),
            id: `ACT-${Date.now()}`
        };

        const activities = await this._getFromGitHubPages('activities');
        activities.unshift(activity);
        
        return await this._sendToGitHub('SAVE_DATA', 'activities', activities);
    }

    // SEARCH FUNCTIONALITY
    async search(query, dataType = null) {
        if (dataType) {
            const data = await this._getFromGitHubPages(dataType);
            return this._searchInData(data, query);
        }

        // Search across all data types
        const [loans, applications, customers] = await Promise.all([
            this.getLoans(),
            this.getApplications(),
            this.getCustomers()
        ]);

        const allResults = [
            ...loans.map(item => ({ ...item, type: 'loan' })),
            ...applications.map(item => ({ ...item, type: 'application' })),
            ...customers.map(item => ({ ...item, type: 'customer' }))
        ];

        return this._searchInData(allResults, query);
    }

    _searchInData(data, query) {
        const searchTerm = query.toLowerCase();
        return data.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );
        });
    }

    // STATISTICS
    async getStatistics() {
        const [loans, applications, customers] = await Promise.all([
            this.getLoans(),
            this.getApplications(),
            this.getCustomers()
        ]);

        const totalLoanAmount = loans.reduce((sum, loan) => sum + (parseFloat(loan.amount) || 0), 0);
        const activeLoans = loans.filter(loan => loan.status === 'active').length;
        const pendingApps = applications.filter(app => app.status === 'submitted' || app.status === 'pending').length;
        const totalInterest = loans.reduce((sum, loan) => sum + (parseFloat(loan.interest) || 0), 0);

        return {
            totalLoans: loans.length,
            totalLoanAmount: totalLoanAmount,
            usdEquivalent: (totalLoanAmount / 2500).toFixed(2),
            activeLoans: activeLoans,
            pendingApplications: pendingApps,
            totalCustomers: customers.length,
            totalInterest: totalInterest,
            totalProfit: totalInterest * 0.7, // Example: 70% of interest is profit
            lastUpdated: new Date().toISOString()
        };
    }

    // ==================== UTILITY METHODS ====================

    _getToken() {
        // In production, this should be managed securely
        // For now, we'll use a placeholder
        const token = sessionStorage.getItem('nkumbise_gh_token');
        
        if (!token) {
            console.warn('GitHub token not found. Some features may not work.');
            return 'ghp_PLACEHOLDER_TOKEN'; // Will be replaced with actual token management
        }
        
        return token;
    }

    _getCurrentUser() {
        const userStr = sessionStorage.getItem('nkumbise_user');
        return userStr ? JSON.parse(userStr) : null;
    }

    // TZS/USD Conversion
    convertTZStoUSD(tzsAmount) {
        return (parseFloat(tzsAmount) / 2500).toFixed(2);
    }

    formatTZS(amount) {
        return `TZS ${parseFloat(amount).toLocaleString('en-TZ')}`;
    }

    formatUSD(tzsAmount) {
        return `$ ${this.convertTZStoUSD(tzsAmount)}`;
    }

    // Sync all local data to GitHub
    async syncAllToGitHub() {
        const dataTypes = ['loans', 'applications', 'customers', 'users', 'activities'];
        
        for (const type of dataTypes) {
            const localData = this._getFromLocalStorage(type);
            if (localData.length > 0) {
                await this._sendToGitHub('SAVE_DATA', type, localData);
            }
        }
        
        return { success: true, message: 'All data synced to GitHub' };
    }
}

// Initialize global API instance
window.nkumbiseAPI = new NkumbiseAPI();

// Auto-sync on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if we need to sync from localStorage
    const lastSync = localStorage.getItem('nkumbise_last_sync');
    const now = Date.now();
    
    if (!lastSync || (now - parseInt(lastSync)) > 3600000) { // 1 hour
        try {
            await window.nkumbiseAPI.syncAllToGitHub();
            localStorage.setItem('nkumbise_last_sync', now.toString());
        } catch (error) {
            console.log('Auto-sync skipped:', error.message);
        }
    }
});
