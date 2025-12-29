// Authentication System for Nkumbise Investment Dashboard
document.addEventListener('DOMContentLoaded', function() {
    initAuthSystem();
});

function initAuthSystem() {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
        showDashboard(currentUser);
        return;
    }

    // Setup login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    
    // Show loading
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Authenticate user (in production, this would validate against your GitHub data)
        const user = await authenticateUser(username, password, role);
        
        if (user) {
            // Store user session
            storeUserSession(user);
            
            // Show dashboard
            showDashboard(user);
        } else {
            alert('Invalid credentials. Please check your username, password, and role.');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

async function authenticateUser(username, password, role) {
    // This is demo authentication - in production, fetch from users.json
    const demoUsers = [
        { id: 'U001', username: 'admin', password: 'admin123', role: 'admin', name: 'System Administrator', lastLogin: null },
        { id: 'U002', username: 'partner', password: 'partner123', role: 'partner', name: 'Tanzania Partner', lastLogin: null },
        { id: 'U003', username: 'account', password: 'account123', role: 'account', name: 'Finance Accountant', lastLogin: null },
        { id: 'U004', username: 'support', password: 'support123', role: 'support', name: 'Customer Support', lastLogin: null }
    ];
    
    // Find matching user
    const user = demoUsers.find(u => 
        u.username === username && 
        u.password === password && 
        u.role === role
    );
    
    if (user) {
        // Update last login
        user.lastLogin = new Date().toISOString();
        return user;
    }
    
    return null;
}

function storeUserSession(user) {
    // Store in localStorage
    const sessionData = {
        user: user,
        timestamp: new Date().getTime(),
        expires: new Date().getTime() + (8 * 60 * 60 * 1000) // 8 hours
    };
    
    localStorage.setItem('nkumbise_session', JSON.stringify(sessionData));
}

function getCurrentUser() {
    const sessionData = localStorage.getItem('nkumbise_session');
    
    if (!sessionData) return null;
    
    try {
        const session = JSON.parse(sessionData);
        
        // Check if session is expired
        if (new Date().getTime() > session.expires) {
            localStorage.removeItem('nkumbise_session');
            return null;
        }
        
        return session.user;
    } catch (error) {
        console.error('Session error:', error);
        return null;
    }
}

function showDashboard(user) {
    // Hide login, show dashboard
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('dashboardContainer').style.display = 'grid';
    
    // Update user info
    document.getElementById('currentUserName').textContent = user.name;
    document.getElementById('currentUserRole').textContent = 
        user.role.charAt(0).toUpperCase() + user.role.slice(1);
    
    // Update dashboard title
    document.getElementById('dashboardTitle').querySelector('h2').textContent = 
        `${user.name}'s Dashboard`;
    
    // Show appropriate menu based on role
    showRoleMenu(user.role);
    
    // Initialize dashboard
    if (typeof initDashboard === 'function') {
        initDashboard(user);
    }
    
    // Show password change alert if needed
    showPasswordChangeAlert(user);
}

function showRoleMenu(role) {
    // Hide all menus first
    document.querySelectorAll('.menu-section').forEach(section => {
        if (!section.querySelector('.fa-cogs')) { // Don't hide common section
            section.style.display = 'none';
        }
    });
    
    // Show role-specific menu
    const roleMenu = document.getElementById(`${role}Menu`);
    if (roleMenu) {
        roleMenu.style.display = 'block';
    }
    
    // Set first item as active
    const firstMenuItem = roleMenu?.querySelector('.menu-item');
    if (firstMenuItem) {
        firstMenuItem.click();
    }
}

function showPasswordChangeAlert(user) {
    // Demo: Show alert for admin user
    if (user.username === 'admin') {
        document.getElementById('passwordChangeAlert').style.display = 'flex';
    }
}

function showNotifications() {
    document.getElementById('notificationsPanel').classList.add('show');
    loadNotifications();
}

function hideNotifications() {
    document.getElementById('notificationsPanel').classList.remove('show');
}

function loadNotifications() {
    const notifications = [
        {
            id: 1,
            title: 'New Loan Application',
            message: 'John Doe applied for $1,500 loan',
            time: '10 minutes ago',
            icon: 'fa-file-alt',
            read: false
        },
        {
            id: 2,
            title: 'Payment Received',
            message: 'Maria Kato made payment of $65',
            time: '1 hour ago',
            icon: 'fa-money-check',
            read: false
        },
        {
            id: 3,
            title: 'System Update',
            message: 'Dashboard updated to version 1.2',
            time: '2 hours ago',
            icon: 'fa-sync',
            read: true
        }
    ];
    
    const container = document.getElementById('notificationsList');
    container.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <div class="notification-icon">
                <i class="fas ${notif.icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notif.title}</div>
                <div class="notification-message">${notif.message}</div>
                <div class="notification-time">${notif.time}</div>
            </div>
        </div>
    `).join('');
    
    // Update notification count
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notificationCount').textContent = unreadCount;
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

window.logout = function() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('nkumbise_session');
        window.location.reload();
    }
};

window.showModal = function(modalId) {
    document.getElementById(modalId).classList.add('show');
};

window.hideModal = function(modalId) {
    document.getElementById(modalId).classList.remove('show');
};

// Password change functionality
document.addEventListener('DOMContentLoaded', function() {
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    if (passwordChangeForm) {
        passwordChangeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validation
            if (newPassword.length < 8) {
                alert('New password must be at least 8 characters');
                return;
            }
            
            if (!/\d/.test(newPassword)) {
                alert('New password must contain at least one number');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match');
                return;
            }
            
            // In production, this would update the password in your GitHub data
            console.log('Password change requested:', { currentPassword, newPassword });
            
            alert('Password changed successfully!');
            hideModal('passwordChangeModal');
            document.getElementById('passwordChangeAlert').style.display = 'none';
            
            // Clear form
            passwordChangeForm.reset();
        });
    }
});
