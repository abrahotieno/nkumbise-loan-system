// Loan Calculator for Nkumbise Investment - TZS with USD equivalent
const EXCHANGE_RATE = 2500; // 1 USD = 2500 TZS

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('amountSlider')) {
        initCalculator();
    }
});

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
    
    // USD equivalent elements
    const usdLoan = document.getElementById('usdLoan');
    const usdInterest = document.getElementById('usdInterest');
    const usdTotal = document.getElementById('usdTotal');
    const amountConversion = document.getElementById('amountConversion');
    const dailyConversion = document.getElementById('dailyConversion');
    
    // Example elements in hero
    const exampleAmount = document.getElementById('exampleAmount');
    const exampleRate = document.getElementById('exampleRate');
    const exampleTotal = document.getElementById('exampleTotal');
    
    // Current values
    let loanAmount = 1000000; // Default: 1,000,000 TZS
    let loanDays = 30;
    
    // Convert TZS to USD
    function tzsToUsd(tzs) {
        return Math.round(tzs / EXCHANGE_RATE);
    }
    
    // Format TZS with USD equivalent
    function formatCurrency(tzs) {
        const usd = tzsToUsd(tzs);
        return `TZS ${tzs.toLocaleString()} (≈ $${usd.toLocaleString()})`;
    }
    
    // Format TZS only
    function formatTzs(tzs) {
        return `TZS ${tzs.toLocaleString()}`;
    }
    
    // Update amount
    function updateAmount(value) {
        loanAmount = parseInt(value);
        if (loanAmount < 500000) loanAmount = 500000;
        if (loanAmount > 5000000) loanAmount = 5000000;
        
        amountSlider.value = loanAmount;
        amountInput.value = loanAmount;
        
        // Update USD conversion
        if (amountConversion) {
            amountConversion.textContent = `≈ $${tzsToUsd(loanAmount).toLocaleString()} USD`;
        }
        
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
        const totalInterest = Math.round(loanAmount * interestRate);
        const totalRepayment = loanAmount + totalInterest;
        const dailyRepayment = Math.round(totalRepayment / loanDays);
        
        // Update TZS display
        if (resultAmount) resultAmount.textContent = formatTzs(loanAmount);
        if (resultInterest) resultInterest.textContent = formatTzs(totalInterest);
        if (resultTotal) resultTotal.textContent = formatTzs(totalRepayment);
        if (resultDaily) resultDaily.textContent = formatTzs(dailyRepayment);
        
        // Update USD equivalents
        if (usdLoan) usdLoan.textContent = `$${tzsToUsd(loanAmount).toLocaleString()}`;
        if (usdInterest) usdInterest.textContent = `$${tzsToUsd(totalInterest).toLocaleString()}`;
        if (usdTotal) usdTotal.textContent = `$${tzsToUsd(totalRepayment).toLocaleString()}`;
        if (dailyConversion) dailyConversion.textContent = `≈ $${tzsToUsd(dailyRepayment).toLocaleString()} USD/day`;
        
        // Update loan example in hero
        updateHeroExample();
    }
    
    // Update hero loan example
    function updateHeroExample() {
        if (exampleAmount && exampleRate && exampleTotal) {
            const totalInterest = Math.round(loanAmount * (loanDays * 0.01));
            const totalRepayment = loanAmount + totalInterest;
            
            exampleAmount.textContent = `TZS ${loanAmount.toLocaleString()}`;
            exampleRate.textContent = `@ 1% daily`;
            exampleTotal.textContent = `TZS ${totalRepayment.toLocaleString()}`;
        }
    }
    
    // Event listeners
    if (amountSlider && amountInput) {
        amountSlider.addEventListener('input', function() {
            updateAmount(this.value);
        });
        
        amountInput.addEventListener('input', function() {
            updateAmount(this.value);
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

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { 
        initCalculator,
        tzsToUsd: function(tzs) { return Math.round(tzs / 2500); }
    };
}

// Make functions available globally
window.tzsToUsd = function(tzs) {
    return Math.round(tzs / 2500);
};

window.formatTzs = function(tzs) {
    return `TZS ${tzs.toLocaleString()}`;
};

window.formatCurrencyWithUsd = function(tzs) {
    const usd = Math.round(tzs / 2500);
    return `TZS ${tzs.toLocaleString()} (≈ $${usd.toLocaleString()})`;
};
