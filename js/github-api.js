// GitHub API Configuration
const GITHUB_CONFIG = {
    username: 'abrahotieno',
    repository: 'nkumbise-loan-system',
    branch: 'main',
    dataFolder: 'data/'
};

// GitHub API Base URL
const GITHUB_API = 'https://api.github.com';

// Initialize with your token (will be set after login)
let githubToken = '';

// Set GitHub Token (call this after user login)
function setGitHubToken(token) {
    githubToken = token;
    console.log('GitHub token set');
}

// Helper function for API requests
async function githubRequest(endpoint, method = 'GET', data = null) {
    const url = `${GITHUB_API}/${endpoint}`;
    
    const headers = {
        'Authorization': `token ${githubToken}`,
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
    
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
        }
        
        if (method === 'GET' || method === 'POST' || method === 'PUT') {
            return await response.json();
        }
        
        return { success: true };
    } catch (error) {
        console.error('GitHub API request failed:', error);
        throw error;
    }
}

// Get file content from repository
async function getFileFromRepo(filename) {
    const endpoint = `repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.dataFolder}${filename}`;
    
    try {
        const fileData = await githubRequest(endpoint);
        
        if (fileData.content) {
            // Decode base64 content
            const content = atob(fileData.content.replace(/\n/g, ''));
            return JSON.parse(content);
        }
        
        return null;
    } catch (error) {
        // File doesn't exist yet, return empty array
        if (error.message.includes('404')) {
            return [];
        }
        throw error;
    }
}

// Save file to repository
async function saveFileToRepo(filename, data) {
    const endpoint = `repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.dataFolder}${filename}`;
    
    try {
        // First try to get existing file to get its SHA
        let sha = null;
        try {
            const existingFile = await githubRequest(endpoint);
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
            branch: GITHUB_CONFIG.branch
        };
        
        if (sha) {
            requestData.sha = sha;
        }
        
        return await githubRequest(endpoint, 'PUT', requestData);
    } catch (error) {
        console.error(`Failed to save ${filename}:`, error);
        throw error;
    }
}

// Loan Data Management Functions
async function loadLoansFromGitHub() {
    try {
        const loans = await getFileFromRepo('loans.json');
        return loans || [];
    } catch (error) {
        console.error('Failed to load loans from GitHub:', error);
        return [];
    }
}

async function saveLoansToGitHub(loans) {
    try {
        await saveFileToRepo('loans.json', loans);
        return true;
    } catch (error) {
        console.error('Failed to save loans to GitHub:', error);
        return false;
    }
}

async function loadApplicationsFromGitHub() {
    try {
        const applications = await getFileFromRepo('applications.json');
        return applications || [];
    } catch (error) {
        console.error('Failed to load applications from GitHub:', error);
        return [];
    }
}

async function saveApplicationsToGitHub(applications) {
    try {
        await saveFileToRepo('applications.json', applications);
        return true;
    } catch (error) {
        console.error('Failed to save applications to GitHub:', error);
        return false;
    }
}

async function loadUsersFromGitHub() {
    try {
        const users = await getFileFromRepo('users.json');
        return users || [];
    } catch (error) {
        console.error('Failed to load users from GitHub:', error);
        return [];
    }
}

async function saveUsersToGitHub(users) {
    try {
        await saveFileToRepo('users.json', users);
        return true;
    } catch (error) {
        console.error('Failed to save users to GitHub:', error);
        return false;
    }
}

// Initialize data folder if it doesn't exist
async function initializeDataFolder() {
    try {
        // Check if data folder exists
        const endpoint = `repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/data`;
        
        try {
            await githubRequest(endpoint);
            // Folder exists
            return true;
        } catch (error) {
            if (error.message.includes('404')) {
                // Create folder by creating a placeholder file
                await saveFileToRepo('initialize.json', { initialized: true, timestamp: new Date().toISOString() });
                return true;
            }
            throw error;
        }
    } catch (error) {
        console.error('Failed to initialize data folder:', error);
        return false;
    }
}

// Export functions
window.GitHubAPI = {
    setToken: setGitHubToken,
    loadLoans: loadLoansFromGitHub,
    saveLoans: saveLoansToGitHub,
    loadApplications: loadApplicationsFromGitHub,
    saveApplications: saveApplicationsToGitHub,
    loadUsers: loadUsersFromGitHub,
    saveUsers: saveUsersToGitHub,
    initialize: initializeDataFolder
};
