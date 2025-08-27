// Budget Tracker Application
class BudgetTracker {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.balanceEl = document.getElementById('balance');
        this.incomeEl = document.getElementById('income');
        this.expenseEl = document.getElementById('expense');
        this.transactionForm = document.getElementById('transaction-form');
        this.transactionList = document.getElementById('transaction-list');
        
        this.init();
    }
    
    init() {
        this.transactionForm.addEventListener('submit', this.addTransaction.bind(this));
        this.updateDisplay();
        this.displayTransactions();
    }
    
    addTransaction(e) {
        e.preventDefault();
        
        const description = document.getElementById('description').value.trim();
        const amount = parseFloat(document.getElementById('amount').value);
        const type = document.getElementById('type').value;
        
        if (!description || !amount || !type) {
            alert('Please fill in all fields');
            return;
        }
        
        if (amount <= 0) {
            alert('Amount must be greater than 0');
            return;
        }
        
        const transaction = {
            id: Date.now(),
            description,
            amount: type === 'expense' ? -amount : amount,
            type,
            date: new Date().toLocaleDateString()
        };
        
        this.transactions.push(transaction);
        this.saveToStorage();
        this.updateDisplay();
        this.displayTransactions();
        this.transactionForm.reset();
    }
    
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(transaction => transaction.id !== id);
        this.saveToStorage();
        this.updateDisplay();
        this.displayTransactions();
    }
    
    updateDisplay() {
        const amounts = this.transactions.map(transaction => transaction.amount);
        
        const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
        const income = amounts
            .filter(item => item > 0)
            .reduce((acc, item) => (acc += item), 0)
            .toFixed(2);
        const expense = (amounts
            .filter(item => item < 0)
            .reduce((acc, item) => (acc += item), 0) * -1
        ).toFixed(2);
        
        this.balanceEl.textContent = `$${total}`;
        this.incomeEl.textContent = `$${income}`;
        this.expenseEl.textContent = `$${expense}`;
        
        // Update balance color based on positive/negative
        if (total >= 0) {
            this.balanceEl.style.color = '#27ae60';
        } else {
            this.balanceEl.style.color = '#e74c3c';
        }
    }
    
    displayTransactions() {
        this.transactionList.innerHTML = '';
        
        if (this.transactions.length === 0) {
            this.transactionList.innerHTML = '<li style="text-align: center; color: #666; padding: 20px;">No transactions yet. Add your first transaction above!</li>';
            return;
        }
        
        // Sort transactions by date (newest first)
        const sortedTransactions = [...this.transactions].sort((a, b) => b.id - a.id);
        
        sortedTransactions.forEach(transaction => {
            const item = document.createElement('li');
            item.className = `transaction-item ${transaction.type}`;
            
            const sign = transaction.amount < 0 ? '-' : '+';
            const amount = Math.abs(transaction.amount).toFixed(2);
            
            item.innerHTML = `
                <div class="transaction-details">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-type">${transaction.type} • ${transaction.date}</div>
                </div>
                <div class="transaction-amount ${transaction.type}">${sign}$${amount}</div>
                <button class="delete-btn" onclick="budgetTracker.deleteTransaction(${transaction.id})">
                    ×
                </button>
            `;
            
            this.transactionList.appendChild(item);
        });
    }
    
    saveToStorage() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }
    
    // Export data as JSON
    exportData() {
        const dataStr = JSON.stringify(this.transactions, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'budget-tracker-data.json';
        link.click();
    }
    
    // Import data from JSON
    importData(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedTransactions = JSON.parse(e.target.result);
                    if (Array.isArray(importedTransactions)) {
                        this.transactions = importedTransactions;
                        this.saveToStorage();
                        this.updateDisplay();
                        this.displayTransactions();
                        alert('Data imported successfully!');
                    } else {
                        alert('Invalid file format');
                    }
                } catch (error) {
                    alert('Error reading file');
                }
            };
            reader.readAsText(file);
        }
    }
    
    // Clear all data
    clearAllData() {
        if (confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
            this.transactions = [];
            this.saveToStorage();
            this.updateDisplay();
            this.displayTransactions();
        }
    }
}

// Initialize the budget tracker when the page loads
let budgetTracker;

document.addEventListener('DOMContentLoaded', function() {
    budgetTracker = new BudgetTracker();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            const submitBtn = document.querySelector('#transaction-form button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    });
    
    // Focus on description field when page loads
    const descriptionField = document.getElementById('description');
    if (descriptionField) {
        descriptionField.focus();
    }
});

// Add some utility functions for enhanced functionality
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Add animation effects
function addTransaction() {
    const form = document.getElementById('transaction-form');
    const button = form.querySelector('button[type="submit"]');
    
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

// Service Worker registration for potential PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
