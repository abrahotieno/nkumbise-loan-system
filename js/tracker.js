// Application Tracker Logic for Nkumbise Investment - TZS with USD equivalent
const EXCHANGE_RATE = 2500; // 1 USD = 2500 TZS

document.addEventListener('DOMContentLoaded', function() {
    initTracker();
});

function initTracker() {
    let currentSearchType = 'id';
    
    // Convert TZS to USD
    function tzsToUsd(tzsAmount) {
        return Math.round(tzsAmount / EXCHANGE_RATE);
    }
    
    // Format TZS with USD equivalent
    function formatCurrency(tzsAmount) {
        if (tzsAmount === 0) return 'TZS 0';
        const usdAmount = tzsToUsd(tzsAmount);
        return `TZS ${tzsAmount.toLocaleString()} (≈ $${usdAmount.toLocaleString()})`;
    }
    
    // Format TZS only
    function formatTzs(tzsAmount) {
        return `TZS ${tzsAmount.toLocaleString()}`;
    }
    
    // Tab switching
    window.switchSearchTab = function(type) {
        currentSearchType = type;
        
        // Update active tab
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        // Show/hide search inputs
        document.getElementById('searchById').style.display = 
            type === 'id' ? 'block' : 'none';
        document.getElementById('searchByPhone').style.display = 
            type === 'phone' ? 'block' : 'none';
    };
    
    // Search function
    window.searchApplication = async function() {
        let searchValue;
        
        if (currentSearchType === 'id') {
            searchValue = document.getElementById('applicationId').value.trim();
            if (!searchValue) {
                alert('Please enter your Application ID');
                return;
            }
        } else {
            searchValue = document.getElementById('phoneNumber').value.trim();
            if (!searchValue) {
                alert('Please enter your phone number');
                return;
            }
        }
        
        // Show loading
        const searchBtn = document.querySelector('.search-button');
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
        searchBtn.disabled = true;
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Try to get from localStorage first
            const applications = JSON.parse(localStorage.getItem('nkumbise_applications') || '[]');
            let foundApplication = null;
            
            if (currentSearchType === 'id') {
                foundApplication = applications.find(app => 
                    app.id.toLowerCase() === searchValue.toLowerCase()
                );
            } else {
                foundApplication = applications.find(app => 
                    app.phoneNumber === searchValue
                );
            }
            
            // If not found in localStorage, show sample data for demo
            if (!foundApplication) {
                foundApplication = getSampleApplication(searchValue);
            }
            
            if (foundApplication) {
                displayApplication(foundApplication);
                document.getElementById('noResults').style.display = 'none';
                document.getElementById('resultsSection').classList.add('active');
            } else {
                document.getElementById('noResults').style.display = 'block';
                document.getElementById('resultsSection').classList.remove('active');
            }
            
        } catch (error) {
            alert('Error searching for application. Please try again.');
            console.error('Search error:', error);
        } finally {
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;
        }
    };
    
    // Reset search
    window.resetSearch = function() {
        document.getElementById('applicationId').value = '';
        document.getElementById('phoneNumber').value = '';
        document.getElementById('noResults').style.display = 'none';
        document.getElementById('resultsSection').classList.remove('active');
    };
    
    // Sample data for demo (when no localStorage data)
    function getSampleApplication(searchValue) {
        // This is demo data - in production, this comes from your actual data
        const sampleApps = [
            {
                id: 'APP20241230001',
                fullName: 'John Doe',
                phoneNumber: '+255123456789',
                email: 'john@example.com',
                location: 'Dar es Salaam',
                businessType: 'Retail Shop',
                amount: 1500000,
                period: 30,
                purpose: 'Buy Stock/Inventory',
                interestRate: 0.3,
                totalInterest: 450000,
                totalRepayment: 1950000,
                dailyRepayment: 65000,
                appliedAt: '2024-12-30T10:30:00Z',
                status: 'under_review',
                currency: 'TZS',
                exchangeRate: EXCHANGE_RATE,
                timeline: [
                    {
                        date: '2024-12-30',
                        time: '10:30 AM',
                        status: 'Application Submitted',
                        completed: true
                    },
                    {
                        date: '2024-12-30',
                        time: '2:45 PM',
                        status: 'Under Initial Review',
                        completed: true
                    },
                    {
                        date: 'Today',
                        time: 'Expected',
                        status: 'Agent Contact',
                        completed: false,
                        current: true
                    },
                    {
                        date: 'Future',
                        time: 'TBD',
                        status: 'Document Verification',
                        completed: false
                    },
                    {
                        date: 'Future',
                        time: 'TBD',
                        status: 'Approval & Disbursement',
                        completed: false
                    }
                ],
                assignedAgent: 'Agent James',
                agentContact: '+255987654321'
            },
            {
                id: 'APP20241229001',
                fullName: 'Maria Kato',
                phoneNumber: '+255987654321',
                email: 'maria@example.com',
                location: 'Arusha',
                businessType: 'Agriculture',
                amount: 2500000,
                period: 60,
                purpose: 'Buy Farming Equipment',
                interestRate: 0.6,
                totalInterest: 1500000,
                totalRepayment: 4000000,
                dailyRepayment: 66667,
                appliedAt: '2024-12-29T14:20:00Z',
                status: 'approved',
                currency: 'TZS',
                exchangeRate: EXCHANGE_RATE,
                timeline: [
                    {
                        date: '2024-12-29',
                        time: '2:20 PM',
                        status: 'Application Submitted',
                        completed: true
                    },
                    {
                        date: '2024-12-29',
                        time: '4:15 PM',
                        status: 'Under Initial Review',
                        completed: true
                    },
                    {
                        date: '2024-12-30',
                        time: '10:00 AM',
                        status: 'Agent Contact Completed',
                        completed: true
                    },
                    {
                        date: '2024-12-30',
                        time: '3:30 PM',
                        status: 'Documents Verified',
                        completed: true
                    },
                    {
                        date: 'Tomorrow',
                        time: 'Expected',
                        status: 'Funds Disbursement',
                        completed: false,
                        current: true
                    }
                ],
                assignedAgent: 'Agent Sarah',
                agentContact: '+255123456789'
            }
        ];
        
        // Find matching application
        const app = sampleApps.find(app => 
            (currentSearchType === 'id' && app.id.toLowerCase() === searchValue.toLowerCase()) ||
            (currentSearchType === 'phone' && app.phoneNumber === searchValue)
        );
        
        return app;
    }
    
    function displayApplication(application) {
        const resultsSection = document.getElementById('resultsSection');
        
        // Get status display
        const statusInfo = getStatusInfo(application.status);
        
        // Format date
        const appliedDate = new Date(application.appliedAt);
        const formattedDate = appliedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) + ' • ' + appliedDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Create HTML with TZS + USD format
        resultsSection.innerHTML = `
            <div class="application-card">
                <div class="card-header">
                    <div class="app-id">#${application.id}</div>
                    <div class="app-status ${statusInfo.class}">
                        ${statusInfo.text}
                    </div>
                </div>
                
                <div class="card-body">
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Applicant Name</div>
                            <div class="info-value">${application.fullName}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Phone Number</div>
                            <div class="info-value">${application.phoneNumber}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Applied Date</div>
                            <div class="info-value">${formattedDate}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Business Type</div>
                            <div class="info-value">${application.businessType}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Loan Amount</div>
                            <div class="info-value">${formatTzs(application.amount)}</div>
                            <div class="info-usd">≈ $${tzsToUsd(application.amount).toLocaleString()} USD</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Total Repayment</div>
                            <div class="info-value">${formatTzs(application.totalRepayment)}</div>
                            <div class="info-usd">≈ $${tzsToUsd(application.totalRepayment).toLocaleString()} USD</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Repayment Period</div>
                            <div class="info-value">${application.period} Days</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Daily Payment</div>
                            <div class="info-value">${formatTzs(application.dailyRepayment)}/day</div>
                            <div class="info-usd">≈ $${tzsToUsd(application.dailyRepayment).toLocaleString()} USD/day</div>
                        </div>
                    </div>
                    
                    ${application.assignedAgent ? `
                    <div class="info-item" style="grid-column: 1 / -1;">
                        <div class="info-label">Assigned Agent</div>
                        <div class="info-value">
                            ${application.assignedAgent} 
                            <span style="color: var(--gray-color); font-weight: normal; margin-left: 1rem;">
                                <i class="fas fa-phone"></i> ${application.agentContact}
                            </span>
                        </div>
                    </div>
                    ` : ''}
                    
                    <h3 style="margin-top: 2rem; margin-bottom: 1rem; color: var(--dark-color);">Application Timeline</h3>
                    <div class="timeline">
                        ${application.timeline.map((item, index) => `
                        <div class="timeline-item ${item.completed ? 'completed' : ''} ${item.current ? 'current' : ''}">
                            <div class="timeline-date">
                                <i class="far fa-calendar"></i> ${item.date} • ${item.time}
                            </div>
                            <div class="timeline-content">
                                ${item.status}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                    
                    <div class="action-buttons">
                        <a href="apply.html" class="btn-primary">
                            <i class="fas fa-paper-plane"></i> Apply for Another Loan
                        </a>
                        <a href="index.html" class="btn-secondary">
                            <i class="fas fa-home"></i> Return to Home
                        </a>
                        <button class="btn-outline" onclick="resetSearch()">
                            <i class="fas fa-search"></i> Track Another
                        </button>
                    </div>
                    
                    <div style="margin-top: 2rem; padding: 1rem; background: rgba(45, 91, 227, 0.05); border-radius: 8px; border: 1px dashed var(--primary-color);">
                        <div style="display: flex; align-items: center; gap: 10px; color: var(--primary-color);">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <strong>Currency Information:</strong> All amounts in Tanzanian Shillings (TZS).
                                USD equivalent shown for reference (1 USD ≈ 2,500 TZS).
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    function getStatusInfo(status) {
        const statusMap = {
            'pending': { text: 'Pending Review', class: 'status-pending' },
            'under_review': { text: 'Under Review', class: 'status-review' },
            'approved': { text: 'Approved', class: 'status-approved' },
            'rejected': { text: 'Rejected', class: 'status-rejected' },
            'disbursed': { text: 'Funds Disbursed', class: 'status-disbursed' },
            'completed': { text: 'Completed', class: 'status-completed' }
        };
        
        return statusMap[status] || { text: 'Unknown', class: 'status-pending' };
    }
}

// Make functions available globally
window.tzsToUsd = function(tzs) {
    return Math.round(tzs / 2500);
};

window.formatTzs = function(tzs) {
    return `TZS ${tzs.toLocaleString()}`;
};
