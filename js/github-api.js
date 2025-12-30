// Nkumbise Loan System - Direct GitHub API
class NkumbiseAPI {
    constructor() {
        this.owner = 'abrahotieno';
        this.repo = 'nkumbise-loan-system';
        this.branch = 'main';
        this.token = null;
    }

    // Set GitHub token
    setToken(token) {
        this.token = token;
        sessionStorage.setItem('nkumbise_gh_token', token);
    }

    // Get token
    getToken() {
        if (this.token) return this.token;
        
        const token = sessionStorage.getItem('nkumbise_gh_token');
        if (token) {
            this.token = token;
            return token;
        }
        
        return null;
    }

    // Direct GitHub API call
    async githubAPI(endpoint, method = 'GET', data = null) {
        const token = this.getToken();
        if (!token) {
            throw new Error('GitHub token not set. Please add token in Settings.');
        }

        const url = `https://api.github.com/${endpoint}`;
        
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        const options = {
            method: method,
            headers: headers
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);
        
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`GitHub API error ${response.status}: ${error}`);
        }

        if (method !== 'DELETE') {
            return await response.json();
        }

        return { success: true };
    }

    // Get file from GitHub
    async getFile(filename) {
        try {
            const endpoint = `repos/${this.owner}/${this.repo}/contents/data/${filename}`;
            const fileData = await this.githubAPI(endpoint);
            
            if (fileData.content) {
                // Decode base64 content
                const content = atob(fileData.content.replace(/\n/g, ''));
                return JSON.parse(content);
            }
            
            return [];
        } catch (error) {
            if (error.message.includes('404')) {
                // File doesn't exist yet
                return [];
            }
            throw error;
        }
    }

    // Save file to GitHub
    async saveFile(filename, data) {
        try {
            const endpoint = `repos/${this.owner}/${this.repo}/contents/data/${filename}`;
            
            // First try to get existing file to get its SHA
            let sha = null;
            try {
                const existingFile = await this.githubAPI(endpoint);
                sha = existingFile.sha;
            } catch (error) {
                // File doesn't exist yet, that's okay
                if (!error.message.includes('404')) {
                    throw error;
                }
            }
            
            // Convert data to base64
            const content = JSON.stringify(data, null, 2);
            const encodedContent = btoa(unescape(encodeURIComponent(content)));
            
            const requestData = {
                message: `Update ${filename} - ${new Date().toISOString()}`,
                content: encodedContent,
                branch: this.branch
            };
            
            if (sha) {
                requestData.sha = sha;
            }
            
            await this.githubAPI(endpoint, 'PUT', requestData);
            return data;
        } catch (error) {
            throw new Error(`Failed to save ${filename}: ${error.message}`);
        }
    }

    // Get data methods
    async getLoans() {
        return await this.getFile('loans.json');
    }

    async saveLoans(loans) {
        return await this.saveFile('loans.json', loans);
    }

    async getApplications() {
        return await this.getFile('applications.json');
    }

    async saveApplications(applications) {
        return await this.saveFile('applications.json', applications);
    }

    async getCustomers() {
        return await this.getFile('customers.json');
    }

    async saveCustomers(customers) {
        return await this.saveFile('customers.json', customers);
    }

    async getUsers() {
        return await this.getFile('users.json');
    }

    async authenticate(username, password) {
        const users = await this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
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

    // Add new loan
    async addLoan(loanData) {
        const loans = await this.getLoans();
        const newLoan = {
            id: 'LOAN-' + Date.now(),
            ...loanData,
            currency: 'TZS',
            status: 'pending',
            created: new Date().toISOString(),
            createdBy: JSON.parse(sessionStorage.getItem('nkumbise_user'))?.username || 'system'
        };
        
        loans.push(newLoan);
        await this.saveLoans(loans);
        return newLoan;
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
