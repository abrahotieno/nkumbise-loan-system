// Application Form Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize application form
    initApplicationForm();
    
    // Initialize loan calculator for application
    initApplicationCalculator();
});

function initApplicationForm() {
    // Current step tracking
    let currentStep = 1;
    const totalSteps = 3;
    
    // Application data storage
    const applicationData = {
        personal: {},
        loan: {},
        collateral: {}
    };
    
    // Generate application ID
    function generateApplicationId() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 900) + 100;
        return `APP${year}${month}${day}${random}`;
    }
    
    // Navigation functions
    window.nextStep = function(next) {
        if (validateStep(currentStep)) {
            saveStepData(currentStep);
            showStep(next);
        }
    };
    
    window.prevStep = function(prev) {
        showStep(prev);
    };
    
    function showStep(step) {
        // Hide all sections
        document.querySelectorAll('.form-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`section${step}`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber === step) {
                stepEl.classList.add('active');
            } else if (stepNumber < step) {
                stepEl.classList.add('completed');
            }
        });
        
        currentStep = step;
        
        // Update review section if we're on step 3
        if (step === 3) {
            updateReviewSection();
        }
    }
    
    function validateStep(step) {
        let isValid = true;
        
        if (step === 1) {
            const name = document.getElementById('fullName').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            const location = document.getElementById('location').value.trim();
            
            if (!name) {
                alert('Please enter your full name');
                isValid = false;
            } else if (!phone) {
                alert('Please enter your phone number');
                isValid = false;
            } else if (!location) {
                alert('Please enter your location');
                isValid = false;
            }
        } else if (step === 2) {
            const amount = document.getElementById('loanAmount').value;
            const period = document.getElementById('repaymentPeriod').value;
            const purpose = document.getElementById('loanPurpose').value;
            
            if (!amount || amount < 500 || amount > 5000) {
                alert('Please enter a valid loan amount between $500 and $5,000');
                isValid = false;
            } else if (!period) {
                alert('Please select a repayment period');
                isValid = false;
            } else if (!purpose) {
                alert('Please select a loan purpose');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function saveStepData(step) {
        if (step === 1) {
            applicationData.personal = {
                fullName: document.getElementById('fullName').value.trim(),
                phoneNumber: document.getElementById('phoneNumber').value.trim(),
                email: document.getElementById('email').value.trim(),
                location: document.getElementById('location').value.trim()
            };
        } else if (step === 2) {
            applicationData.loan = {
                amount: parseInt(document.getElementById('loanAmount').value),
                period: parseInt(document.getElementById('repaymentPeriod').value),
                purpose: document.getElementById('loanPurpose').value
            };
            
            // Calculate loan details
            const dailyRate = 0.01;
            const interestRate = applicationData.loan.period * dailyRate;
            const totalInterest = applicationData.loan.amount * interestRate;
            const totalRepayment = applicationData.loan.amount + totalInterest;
            
            applicationData.loanDetails = {
                interestRate: interestRate,
                totalInterest: totalInterest,
                totalRepayment: totalRepayment,
                dailyRepayment: totalRepayment / applicationData.loan.period
            };
            
            // Save collateral if provided
            const collateralType = document.getElementById('collateralType').value;
            const collateralValue = document.getElementById('collateralValue').value;
            
            if (collateralType) {
                applicationData.collateral = {
                    type: collateralType,
                    value: collateralValue ? parseInt(collateralValue) : null
                };
            }
        }
    }
    
    function updateReviewSection() {
        // Update review fields
        const appId = generateApplicationId();
        document.getElementById('reviewAppId').textContent = `#${appId}`;
        document.getElementById('reviewName').textContent = applicationData.personal.fullName;
        document.getElementById('reviewPhone').textContent = applicationData.personal.phoneNumber;
        document.getElementById('reviewLocation').textContent = applicationData.personal.location;
        document.getElementById('reviewAmount').textContent = `$${applicationData.loan.amount.toLocaleString()}`;
        document.getElementById('reviewPeriod').textContent = `${applicationData.loan.period} Days`;
        document.getElementById('reviewTotal').textContent = `$${applicationData.loanDetails.totalRepayment.toLocaleString()}`;
        document.getElementById('reviewPurpose').textContent = applicationData.loan.purpose;
    }
    
    window.submitApplication = async function() {
        // Generate final application data
        const applicationId = generateApplicationId();
        const now = new Date();
        
        const finalApplication = {
            id: applicationId,
            ...applicationData.personal,
            ...applicationData.loan,
            ...applicationData.loanDetails,
            ...applicationData.collateral,
            status: 'pending',
            appliedAt: now.toISOString(),
            notes: ''
        };
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
            // In production, this would save to your GitHub data file
            // For now, we'll simulate success and show confirmation
            
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show confirmation screen
            document.getElementById('section3').classList.remove('active');
            document.getElementById('confirmationScreen').classList.add('active');
            
            // Update confirmation details
            document.getElementById('confirmAppId').textContent = `#${applicationId}`;
            document.getElementById('confirmDate').textContent = 
                now.toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                }) + ' - ' + 
                now.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            
            // In production, uncomment this to save to GitHub:
            // await saveToGitHub('applications.json', finalApplication);
            
        } catch (error) {
            alert('Error submitting application. Please try again.');
            console.error('Submission error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    };
    
    // Save to GitHub function (for production)
    async function saveToGitHub(filename, data) {
        // This would use GitHub API to update your data file
        // You would need to implement OAuth and API calls
        console.log('Would save to GitHub:', filename, data);
    }
}

function initApplicationCalculator() {
    const amountSlider = document.getElementById('amountSlider');
    const amountInput = document.getElementById('loanAmount');
    const periodSelect = document.getElementById('repaymentPeriod');
    
    // Summary elements
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryInterest = document.getElementById('summaryInterest');
    const summaryTotal = document.getElementById('summaryTotal');
    
    // Update calculator
    function updateCalculator() {
        const amount = parseInt(amountInput.value);
        const period = parseInt(periodSelect.value);
        
        // Validate amount
        if (amount < 500) amountInput.value = 500;
        if (amount > 5000) amountInput.value = 5000;
        
        // Calculate
        const dailyRate = 0.01;
        const interestRate = period * dailyRate;
        const totalInterest = amount * interestRate;
        const totalRepayment = amount + totalInterest;
        
        // Update slider sync
        if (amountSlider) amountSlider.value = amount;
        
        // Update summary
        if (summaryAmount) summaryAmount.textContent = `$${amount.toLocaleString()}`;
        if (summaryInterest) summaryInterest.textContent = `$${totalInterest.toLocaleString()}`;
        if (summaryTotal) summaryTotal.textContent = `$${totalRepayment.toLocaleString()}`;
    }
    
    // Event listeners
    if (amountSlider && amountInput) {
        amountSlider.addEventListener('input', function() {
            amountInput.value = this.value;
            updateCalculator();
        });
        
        amountInput.addEventListener('input', updateCalculator);
    }
    
    if (periodSelect) {
        periodSelect.addEventListener('change', updateCalculator);
    }
    
    // Initial calculation
    updateCalculator();
}
