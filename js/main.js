// Main JavaScript for Nkumbise Investment - TZS with USD equivalent
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
        
        // Responsive menu handling
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                navLinks.style.display = 'flex';
            } else {
                navLinks.style.display = 'none';
            }
        });
        
        // Initialize mobile menu state
        if (window.innerWidth <= 768) {
            navLinks.style.display = 'none';
        }
    }
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }
            }
        });
    });
    
    // Active nav link highlighting
    function highlightActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-links a');
        
        navLinks.forEach(link => {
            const linkPath = link.getAttribute('href');
            
            // Remove active class from all
            link.classList.remove('active');
            
            // Check if current page matches link
            if (currentPath.endsWith(linkPath) || 
                (currentPath.endsWith('/') && linkPath === 'index.html') ||
                (currentPath.includes('nkumbise-loan-system') && !currentPath.includes('.') && linkPath === 'index.html')) {
                link.classList.add('active');
            }
        });
    }
    
    highlightActiveNav();
    
    // Currency formatters for TZS
    if (typeof window.tzsToUsd !== 'function') {
        window.tzsToUsd = function(tzs) {
            return Math.round(tzs / 2500); // 1 USD = 2500 TZS
        };
    }
    
    if (typeof window.formatTzs !== 'function') {
        window.formatTzs = function(tzs) {
            return `TZS ${tzs.toLocaleString()}`;
        };
    }
    
    if (typeof window.formatCurrencyWithUsd !== 'function') {
        window.formatCurrencyWithUsd = function(tzs) {
            const usd = Math.round(tzs / 2500);
            return `TZS ${tzs.toLocaleString()} (≈ $${usd.toLocaleString()})`;
        };
    }
    
    // Initialize loan calculator if on homepage
    if (typeof initCalculator === 'function' && document.getElementById('amountSlider')) {
        initCalculator();
    }
    
    // Initialize application form if on apply page
    if (typeof initApplicationForm === 'function' && document.getElementById('loanApplicationForm')) {
        initApplicationForm();
    }
    
    // Initialize tracker if on track page
    if (typeof initTracker === 'function' && document.getElementById('applicationId')) {
        initTracker();
    }
    
    // Add currency info tooltips
    addCurrencyTooltips();
    
    // Update all currency displays on page
    updateCurrencyDisplays();
});

// Add currency information tooltips
function addCurrencyTooltips() {
    // Find all elements with TZS amounts and add tooltips
    const tzsElements = document.querySelectorAll('[data-tzs-amount]');
    
    tzsElements.forEach(element => {
        const tzsAmount = parseInt(element.dataset.tzsAmount);
        if (!isNaN(tzsAmount) && tzsAmount > 0) {
            const usdAmount = window.tzsToUsd(tzsAmount);
            element.title = `≈ $${usdAmount.toLocaleString()} USD (1 USD = 2,500 TZS)`;
        }
    });
}

// Update currency displays throughout the page
function updateCurrencyDisplays() {
    // This function can be called to update all currency displays
    // when exchange rate changes or for dynamic updates
    
    // Update any dynamic currency displays
    const currencyNotes = document.querySelectorAll('.currency-note, .currency-info');
    currencyNotes.forEach(note => {
        if (note.textContent.includes('TZS') && !note.textContent.includes('2,500')) {
            note.innerHTML = note.innerHTML.replace(
                /1 USD ≈ \d+ TZS/g,
                '1 USD ≈ 2,500 TZS'
            );
        }
    });
}

// Utility function to convert and format currency
function convertAndFormatCurrency(amount, fromCurrency, toCurrency) {
    if (fromCurrency === 'TZS' && toCurrency === 'USD') {
        const usd = Math.round(amount / 2500);
        return `$${usd.toLocaleString()}`;
    } else if (fromCurrency === 'USD' && toCurrency === 'TZS') {
        const tzs = Math.round(amount * 2500);
        return `TZS ${tzs.toLocaleString()}`;
    }
    return amount;
}

// Make utility functions available globally
window.NkumbiseUtils = {
    tzsToUsd: window.tzsToUsd,
    formatTzs: window.formatTzs,
    formatCurrencyWithUsd: window.formatCurrencyWithUsd,
    convertAndFormatCurrency: convertAndFormatCurrency
};

// Error handling for currency operations
window.addEventListener('error', function(e) {
    if (e.message.includes('currency') || e.message.includes('TZS') || e.message.includes('USD')) {
        console.warn('Currency conversion error:', e.message);
        // Fallback to basic formatting
        if (typeof window.formatTzs !== 'function') {
            window.formatTzs = function(tzs) {
                return `TZS ${tzs}`;
            };
        }
    }
});

// Export for Node.js environment (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        tzsToUsd: window.tzsToUsd,
        formatTzs: window.formatTzs,
        formatCurrencyWithUsd: window.formatCurrencyWithUsd
    };
}
