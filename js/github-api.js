// Nkumbise Loan System - GitHub API Client
class NkumbiseAPI {
    constructor() {
        this.owner = 'abrahotieno';
        this.repo = 'nkumbise-loan-system';
        this.cache = {};
    }

    // Get data from GitHub Pages
    async getData(type) {
        try {
            const url = `https://${this.owner}.github.io/${this.repo}/data/${type}.json`;
            const response = await fetch(url);
            
            if (!response.ok) {
                if (response.status === 404) {
                    // File doesn't exist yet
                    return [];
                }
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.warn(`Failed to load ${type}:`, error);
            
            // Fallback to localStorage
            return this.getLocalData(type);
        }
    }

    // Save data via GitHub API
    async saveData(type, data, id = null) {
        try {
            const token = this.getToken();
            if (!token) {
                throw new Error('GitHub token not set');
            }

            const response = await fetch(`https://api.github.com/repos/${this.owner}/${this.repo}/dispatches`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    event_type: 'loan-api-request',
                    client_payload: {
                        action: 'save',
                        type: type,
                        data: data,
                        id: id,
                        timestamp: new Date().toISOString()
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            console.log(`Data saved to GitHub: ${type}`);
            
            // Wait for GitHub Action to process
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Return updated data
            return await this.getData(type);

        } catch (error) {
            console.error('Save failed:', error);
            
            // Fallback to localStorage
            return this.saveLocalData(type, data, id);
        }
    }

    // Local storage fallback
    getLocalData(type) {
        try {
            const data = localStorage.getItem(`nkumbise_${type}`);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    saveLocalData(type, newData, id = null) {
        try {
            let data = this.getLocalData(type);
            const timestamp = new Date().toISOString();
            
            if (id) {
                const index = data.findIndex(item => item.id === id);
                if (index !== -1) {
                    data[index] = { ...data[index], ...newData, updatedAt: timestamp };
                } else {
                    data.push({ id, ...newData, createdAt: timestamp });
                }
            } else {
                const newId = `${type.slice(0,3).toUpperCase()}-${Date.now()}`;
                data.push({
                    id: newId,
                    ...newData,
                    createdAt: timestamp,
                    currency: 'TZS'
                });
            }
            
            localStorage.setItem(`nkumbise_${type}`, JSON.stringify(data));
            return data;
        } catch (error) {
            console.error('Local save failed:', error);
            return [];
        }
    }

    // Token management
    getToken() {
        // Check session storage first
        const sessionToken = sessionStorage.getItem('nkumbise_gh_token');
        if (sessionToken) return sessionToken;
        
        // Check localStorage
        const localToken = localStorage.getItem('nkumbise_gh_token');
        if (localToken) {
            sessionStorage.setItem('nkumbise_gh_token', localToken);
            return localToken;
        }
        
        return null;
    }

    setToken(token) {
        sessionStorage.setItem('nkumbise_gh_token', token);
        localStorage.setItem('nkumbise_gh_token', token);
    }

    // Loan operations
    async getLoans() {
        return await this.getData('loans');
    }

    async saveLoan(loanData, id = null) {
        return await this.saveData('loans', loanData, id);
    }

    // Application operations
    async getApplications() {
        return await this.getData('applications');
    }

    async saveApplication(appData, id = null) {
        return await this.saveData('applications', appData, id);
    }

    // Customer operations
    async getCustomers() {
        return await this.getData('customers');
    }

    async saveCustomer(customerData, id = null) {
        return await this.saveData('customers', customerData, id);
    }

    // User operations
    async getUsers() {
        return await this.getData('users');
    }

    // Currency conversion
    tzsToUSD(tzsAmount) {
        return (parseFloat(tzsAmount) / 2500).toFixed(2);
    }

    formatTZS(amount) {
        return `TZS ${parseFloat(amount).toLocaleString()}`;
    }

    formatUSD(tzsAmount) {
        return `$${this.tzsToUSD(tzsAmount)} USD`;
    }
}

// Create global instance
window.nkumbiseAPI = new NkumbiseAPI();
