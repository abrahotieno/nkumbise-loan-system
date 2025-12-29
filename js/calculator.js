// Loan Calculator Functionality
function initCalculator() {
    const amountSlider = document.getElementById('amountSlider');
    const amountInput = document.getElementById('loanAmount');
    const dayOptions = document.querySelectorAll('.day-option');
    const loanDaysInput = document.getElementById('loanDays');
    
    // Result elements
    const resultAmount = document.getElementById('resultAmount');
    const resultInterest = document.getElementById('resultInterest');
    const resultTotal = document.getElementById('resultTotal');
    const resultDaily = document.getElementById('resultDaily');
    
    // Current values
    let loanAmount = 1000;
    let loanDays = 30;
    
    // Update slider and input sync
    function updateAmount(value) {
        loanAmount = parseInt(value);
        amountSlider.value = loanAmount;
        amountInput.value = loanAmount;
        calculateLoan();
    }
    
    // Update days
    function updateDays(days) {
        loanDays = parseInt(days);
        loanDaysInput.value = loanDays;
        
        // Update active day button
        dayOptions.forEach(option => {
            if (parseInt(option.dataset.days) === loanDays) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        calculateLoan();
    }
    
    // Calculate loan details
    function calculateLoan() {
        // 1% daily interest
        const dailyRate = 0.01;
        const interestRate = loanDays * dailyRate;
        const totalInterest = loanAmount * interestRate;
        const totalRepayment = loanAmount + totalInterest;
        const dailyRepayment = totalRepayment / loanDays;
        
        // Update display
        resultAmount.textContent = `$${loanAmount.toLocaleString()}`;
        resultInterest.textContent = `$${totalInterest.toLocaleString()}`;
        resultTotal.textContent = `$${totalRepayment.toLocaleString()}`;
        resultDaily.textContent = `$${dailyRepayment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        
        // Update loan example in hero
        updateHeroExample();
    }
    
    // Update hero loan example
    function updateHeroExample() {
        const exampleAmount = document.querySelector('.example-row:nth-child(1) strong');
        const exampleDays = document.querySelector('.example-row:nth-child(2) strong');
        const exampleTotal = document.querySelector('.example-row.total strong');
        
        if (exampleAmount && exampleDays && exampleTotal) {
            const totalInterest = loanAmount * (loanDays * 0.01);
            const totalRepayment = loanAmount + totalInterest;
            
            exampleAmount.textContent = `$${loanAmount.toLocaleString()}`;
            exampleDays.textContent = `@ 1% daily`;
            exampleTotal.textContent = `$${totalRepayment.toLocaleString()}`;
        }
    }
    
    // Event listeners
    if (amountSlider && amountInput) {
        amountSlider.addEventListener('input', function() {
            updateAmount(this.value);
        });
        
        amountInput.addEventListener('input', function() {
            let value = parseInt(this.value);
            if (value < 500) value = 500;
            if (value > 5000) value = 5000;
            updateAmount(value);
        });
    }
    
    if (dayOptions.length > 0) {
        dayOptions.forEach(option => {
            option.addEventListener('click', function() {
                updateDays(this.dataset.days);
            });
        });
    }
    
    // Initial calculation
    calculateLoan();
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initCalculator };
}
