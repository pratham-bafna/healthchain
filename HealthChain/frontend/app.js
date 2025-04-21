// API Configuration
const API_BASE_URL = 'http://localhost:3000/api';

// State Management
let currentUser = null;

// DOM Elements
const loadingSpinner = document.getElementById('loadingSpinner');
const navRegister = document.getElementById('navRegister');
const navLogin = document.getElementById('navLogin');
const navRecords = document.getElementById('navRecords');
const userInfo = document.getElementById('userInfo');
const welcomeMessage = document.getElementById('welcomeMessage');
const addRecordForm = document.getElementById('addRecordForm');
const searchRecordsBtn = document.getElementById('searchRecords');
const verifyChainBtn = document.getElementById('verifyChain');
const recordsList = document.getElementById('recordsList');
const verificationResult = document.getElementById('verificationResult');
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');

// Utility Functions
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} notification`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '1000';
    
    setTimeout(() => notification.remove(), 3000);
}

function updateUIForUser(user) {
    currentUser = user;
    if (user) {
        navRegister.style.display = 'none';
        navLogin.style.display = 'none';
        navRecords.style.display = 'block';
        userInfo.style.display = 'flex';
        welcomeMessage.textContent = `Welcome, ${user.username}`;
        showSection('records');
    } else {
        navRegister.style.display = 'block';
        navLogin.style.display = 'block';
        navRecords.style.display = 'none';
        userInfo.style.display = 'none';
        showSection('home');
    }
}

// Navigation
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

// Registration Form Handler
document.getElementById('registrationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    
    try {
        submitButton.disabled = true;
        spinner.style.display = 'inline-block';
        
        const formData = {
            username: form.username.value,
            password: form.password.value,
            email: form.email.value
        };

        const response = await fetch(`${API_BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Registration successful! Please login.', 'success');
            form.reset();
            showSection('login');
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        showNotification(error.message, 'danger');
    } finally {
        submitButton.disabled = false;
        spinner.style.display = 'none';
    }
});

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    
    try {
        submitButton.disabled = true;
        spinner.style.display = 'inline-block';
        
        const formData = {
            username: form.loginUsername.value,
            password: form.loginPassword.value
        };

        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            localStorage.setItem('token', data.token);
            updateUIForUser(data.user);
            showNotification('Login successful!', 'success');
            form.reset();
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        showNotification(error.message, 'danger');
    } finally {
        submitButton.disabled = false;
        spinner.style.display = 'none';
    }
});

// Record Form Handler
document.getElementById('recordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    
    try {
        submitButton.disabled = true;
        spinner.style.display = 'inline-block';
        
        const formData = {
            patient_id: parseInt(form.patient_id.value),
            doctor_id: parseInt(form.doctor_id.value),
            diagnosis: form.diagnosis.value,
            prescription: form.prescription.value
        };

        const response = await fetch(`${API_BASE_URL}/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (data.success) {
            showNotification('Record added successfully!', 'success');
            form.reset();
            // Refresh records list
            document.getElementById('searchPatientId').value = formData.patient_id;
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        } else {
            throw new Error(data.error || 'Failed to add record');
        }
    } catch (error) {
        showNotification(error.message, 'danger');
    } finally {
        submitButton.disabled = false;
        spinner.style.display = 'none';
    }
});

// Search Form Handler
document.getElementById('searchForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const patientId = form.searchPatientId.value;
    
    try {
        showLoading(true);
        
        const response = await fetch(`${API_BASE_URL}/records/${patientId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const data = await response.json();
        
        if (data.success) {
            displayRecords(data.records);
        } else {
            throw new Error(data.error || 'Failed to fetch records');
        }
    } catch (error) {
        showNotification(error.message, 'danger');
        document.getElementById('recordsList').innerHTML = `
            <div class="list-group-item text-center text-muted">
                No records found
            </div>
        `;
    } finally {
        showLoading(false);
    }
});

// Logout Handler
function logout() {
    localStorage.removeItem('token');
    currentUser = null;
    updateUIForUser(null);
    showNotification('Logged out successfully', 'info');
}

// Display Records
function displayRecords(records) {
    const recordsList = document.getElementById('recordsList');
    
    if (!records || records.length === 0) {
        recordsList.innerHTML = `
            <div class="list-group-item text-center text-muted">
                No records found
            </div>
        `;
        return;
    }
    
    recordsList.innerHTML = records.map(record => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-1">Record #${record.id}</h6>
                <small class="text-muted">
                    ${new Date(record.timestamp).toLocaleString()}
                </small>
            </div>
            <p class="mb-1"><strong>Diagnosis:</strong> ${record.diagnosis}</p>
            ${record.prescription ? `<p class="mb-1"><strong>Prescription:</strong> ${record.prescription}</p>` : ''}
            <small class="text-muted">
                Doctor ID: ${record.doctor_id} | Patient ID: ${record.patient_id}
            </small>
        </div>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (token) {
        // Verify token and get user info
        fetch(`${API_BASE_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUIForUser(data.user);
            } else {
                localStorage.removeItem('token');
                updateUIForUser(null);
            }
        })
        .catch(() => {
            localStorage.removeItem('token');
            updateUIForUser(null);
        });
    } else {
        updateUIForUser(null);
    }
});

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show target section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === targetId) {
                section.classList.add('active', 'fade-in');
            }
        });
    });
});

// Verify Chain Handler
verifyChainBtn.addEventListener('click', async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/validate`);
        const result = await response.json();
        
        if (result.success) {
            const status = result.isValid ? 'valid' : 'invalid';
            const className = result.isValid ? 'text-success' : 'text-danger';
            verificationResult.innerHTML = `
                <div class="${className} fw-bold">
                    Blockchain is ${status}!
                </div>
            `;
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        showNotification(`Error: ${error.message}`, 'error');
    }
}); 