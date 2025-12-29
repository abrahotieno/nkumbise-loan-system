// Application Tracker Logic
document.addEventListener('DOMContentLoaded', function() {
    initTracker();
});

function initTracker() {
    let currentSearchType = 'id';
    
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
            
            // For demo purposes, show sample data
            // In production, this would fetch from your GitHub data
            const sampleApplication = getSampleApplication(searchValue);
            
            if (sampleApplication) {
                displayApplication(sampleApplication);
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
}

// Sample data for demo (replace with actual GitHub API calls)
function getSampleApplication(searchValue) {
    // This is demo data - in production, fetch from GitHub
    const sampleApps = [
        {
            id: 'APP20241230001',
            fullName: 'John Doe',
            phoneNumber: '+255123456789',
            amount: 1500,
            period: 30,
            purpose: 'Business Expansion',
            appliedAt: '2024-12-30T10:30:00Z',
            status: 'under_review',
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
            loanDetails: {
                amount: 1500,
                interest: 450,
                totalRepayment: 1950,
                dailyRepayment: 65
            },
            assignedAgent: 'Agent James',
            agentContact: '+255987654321'
        },
        {
            id: 'APP20241229001',
            fullName: 'Maria Kato',
            phoneNumber: '+255987654321',
            amount: 2500,
            period: 60,
            purpose: 'Medical Expenses',
            appliedAt: '2024-12-29T14:20:00Z',
            status: 'approved',
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
            loanDetails: {
                amount: 2500,
                interest: 1500,
                totalRepayment: 4000,
                dailyRepayment: 66.67
            },
            assignedAgent: 'Agent Sarah',
            agentContact: '+255123456789'
        }
    ];
    
    // Find matching application
    const app = sampleApps.find(app => 
        app.id.toLowerCase() === searchValue.toLowerCase() ||
        app.phoneNumber === searchValue
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
    });
    
    // Create HTML
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
                        <div class="info-label">Loan Purpose</div>
                        <div class="info-value">${application.purpose}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Loan Amount</div>
                        <div class="info-value">$${application.amount.toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Total Repayment</div>
                        <div class="info-value">$${application.loanDetails.totalRepayment.toLocaleString()}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Repayment Period</div>
                        <div class="info-value">${application.period} Days</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Daily Payment</div>
                        <div class="info-value">$${application.loanDetails.dailyRepayment.toFixed(2)}/day</div>
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
                
                <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Application Timeline</h3>
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

// In production, this function would fetch from GitHub
async function fetchFromGitHub(filename) {
    try {
        // This would be your GitHub API call
        // Example: fetch(`https://api.github.com/repos/abrahotieno/nkumbise-loan-system/contents/data/${filename}`)
        console.log('Would fetch from GitHub:', filename);
        return null;
    } catch (error) {
        console.error('GitHub fetch error:', error);
        return null;
    }
}
