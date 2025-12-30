// Application Form Logic for Nkumbise Investment - TZS with USD equivalent
const EXCHANGE_RATE = 2500; // 1 USD = 2500 TZS

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
            const businessType = document.getElementById('businessType').value;
            
            if (!name) {
                alert('Please enter your full name');
                isValid = false;
            } else if (!phone) {
                alert('Please enter your phone number');
                isValid = false;
            } else if (!location) {
                alert('Please enter your location');
                isValid = false;
            } else if (!businessType) {
                alert('Please select your business type');
                isValid = false;
            }
        } else if (step === 2) {
            const amount = document.getElementById('loanAmount').value;
            const period = document.getElementById('repaymentPeriod').value;
            const purpose = document.getElementById('loanPurpose').value;
            
            if (!amount || amount < 500000 || amount > 5000000) {
                alert('Please enter a valid loan amount between TZS 500,000 and TZS 5,000,000');
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
                location: document.getElementById('location').value.trim(),
                businessType: document.getElementById('businessType').value
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
            const totalInterest = Math.round(applicationData.loan.amount * interestRate);
            const totalRepayment = applicationData.loan.amount + totalInterest;
            const dailyRepayment = Math.round(totalRepayment / applicationData.loan.period);
            
            applicationData.loanDetails = {
                interestRate: interestRate,
                totalInterest: totalInterest,
                totalRepayment: totalRepayment,
                dailyRepayment: dailyRepayment
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
        // Generate and display application ID
        const appId = generateApplicationId();
        document.getElementById('reviewAppId').textContent = `#${appId}`;
        
        // Update personal info
        document.getElementById('reviewName').textContent = applicationData.personal.fullName;
        document.getElementById('reviewPhone').textContent = applicationData.personal.phoneNumber;
        document.getElementById('reviewLocation').textContent = applicationData.personal.location;
        document.getElementById('reviewBusiness').textContent = applicationData.personal.businessType;
        
        // Update loan info with TZS formatting
        const amount = applicationData.loan.amount;
        const totalRepayment = applicationData.loanDetails.totalRepayment;
        const dailyRepayment = applicationData.loanDetails.dailyRepayment;
        
        document.getElementById('reviewAmount').textContent = formatTzs(amount);
        document.getElementById('reviewAmountUsd').textContent = `≈ $${tzsToUsd(amount).toLocaleString()} USD`;
        
        document.getElementById('reviewPeriod').textContent = `${applicationData.loan.period} Days`;
        document.getElementById('reviewPurpose').textContent = applicationData.loan.purpose;
        
        document.getElementById('reviewTotal').textContent = formatTzs(totalRepayment);
        document.getElementById('reviewTotalUsd').textContent = `≈ $${tzsToUsd(totalRepayment).toLocaleString()} USD`;
        
        document.getElementById('reviewDaily').textContent = formatTzs(dailyRepayment);
        document.getElementById('reviewDailyUsd').textContent = `≈ $${tzsToUsd(dailyRepayment).toLocaleString()} USD/day`;
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
            notes: '',
            currency: 'TZS',
            exchangeRate: EXCHANGE_RATE
        };
        
        // Show loading state
        const submitBtn = document.querySelector('.btn-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
        submitBtn.disabled = true;
        
        try {
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
            
            // Store application in localStorage for tracking
            const applications = JSON.parse(localStorage.getItem('nkumbise_applications') || '[]');
            applications.push(finalApplication);
            localStorage.setItem('nkumbise_applications', JSON.stringify(applications));
            
        } catch (error) {
            alert('Error submitting application. Please try again.');
            console.error('Submission error:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    };
}

function initApplicationCalculator() {
    const amountSlider = document.getElementById('amountSlider');
    const amountInput = document.getElementById('loanAmount');
    const periodSelect = document.getElementById('repaymentPeriod');
    const collateralValue = document.getElementById('collateralValue');
    
    // Summary elements
    const summaryAmount = document.getElementById('summaryAmount');
    const summaryAmountUsd = document.getElementById('summaryAmountUsd');
    const summaryInterest = document.getElementById('summaryInterest');
    const summaryInterestUsd = document.getElementById('summaryInterestUsd');
    const summaryTotal = document.getElementById('summaryTotal');
    const summaryTotalUsd = document.getElementById('summaryTotalUsd');
    const summaryDaily = document.getElementById('summaryDaily');
    const summaryDailyUsd = document.getElementById('summaryDailyUsd');
    const amountUsd = document.getElementById('amountUsd');
    const collateralUsd = document.getElementById('collateralUsd');
    
    // Convert TZS to USD
    function tzsToUsd(tzsAmount) {
        return Math.round(tzsAmount / EXCHANGE_RATE);
    }
    
    // Update calculator
    function updateCalculator() {
        const amount = parseInt(amountInput.value) || 0;
        const period = parseInt(periodSelect.value) || 30;
        
        // Validate amount
        if (amount < 500000) amountInput.value = 500000;
        if (amount > 5000000) amountInput.value = 5000000;
        
        // Calculate
        const dailyRate = 0.01;
        const interestRate = period * dailyRate;
        const totalInterest = Math.round(amount * interestRate);
        const totalRepayment = amount + totalInterest;
        const dailyRepayment = Math.round(totalRepayment / period);
        
        // Update slider sync
        if (amountSlider) amountSlider.value = amount;
        
        // Update summary with TZS and USD
        if (summaryAmount) summaryAmount.textContent = `TZS ${amount.toLocaleString()}`;
        if (summaryAmountUsd) summaryAmountUsd.textContent = `≈ $${tzsToUsd(amount).toLocaleString()} USD`;
        
        if (summaryInterest) summaryInterest.textContent = `TZS ${totalInterest.toLocaleString()}`;
        if (summaryInterestUsd) summaryInterestUsd.textContent = `≈ $${tzsToUsd(totalInterest).toLocaleString()} USD`;
        
        if (summaryTotal) summaryTotal.textContent = `TZS ${totalRepayment.toLocaleString()}`;
        if (summaryTotalUsd) summaryTotalUsd.textContent = `≈ $${tzsToUsd(totalRepayment).toLocaleString()} USD`;
        
        if (summaryDaily) summaryDaily.textContent = `TZS ${dailyRepayment.toLocaleString()}/day`;
        if (summaryDailyUsd) summaryDailyUsd.textContent = `≈ $${tzsToUsd(dailyRepayment).toLocaleString()} USD/day`;
        
        if (amountUsd) amountUsd.textContent = `≈ $${tzsToUsd(amount).toLocaleString()} USD`;
    }
    
    // Update collateral USD conversion
    function updateCollateralUsd() {
        const value = parseInt(collateralValue.value) || 0;
        if (collateralUsd) {
            if (value > 0) {
                collateralUsd.textContent = `≈ $${tzsToUsd(value).toLocaleString()} USD`;
            } else {
                collateralUsd.textContent = '';
            }
        }
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
    
    if (collateralValue) {
        collateralValue.addEventListener('input', updateCollateralUsd);
    }
    
    // Initial calculation
    updateCalculator();
    updateCollateralUsd();
}

// Make functions available globally
if (typeof window !== 'undefined') {
    window.tzsToUsd = function(tzs) {
        return Math.round(tzs / 2500);
    };
    
    window.formatTzs = function(tzs) {
        return `TZS ${tzs.toLocaleString()}`;
    };
}
