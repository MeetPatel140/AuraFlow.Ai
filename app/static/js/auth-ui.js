// Initialize auth UI when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Auth UI initializing...');
    
    // Initialize particles
    initParticles();
    
    // Initialize form switching
    initFormSwitching();
    
    // Initialize password toggles
    initPasswordToggles();
    
    // Initialize form submissions
    initFormSubmissions();
    
    console.log('Auth UI initialized');
});

// Initialize particles
function initParticles() {
    // Particle animation for background
    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.size = Math.random() * 5 + 1;
            this.speedX = Math.random() * 3 - 1.5;
            this.speedY = Math.random() * 3 - 1.5;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x > window.innerWidth) this.x = 0;
            if (this.x < 0) this.x = window.innerWidth;
            if (this.y > window.innerHeight) this.y = 0;
            if (this.y < 0) this.y = window.innerHeight;
        }

        draw() {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${this.x}px`;
            particle.style.top = `${this.y}px`;
            particle.style.width = `${this.size}px`;
            particle.style.height = `${this.size}px`;
            return particle;
        }
    }

    // Get background element
    const background = document.querySelector('.auth-background');
    if (background) {
        // Create particles
        const particles = Array.from({ length: 50 }, () => new Particle());

        // Animate particles
        function animateParticles() {
            if (!background) return;
            
            background.innerHTML = '';
            particles.forEach(particle => {
                particle.update();
                background.appendChild(particle.draw());
            });
            requestAnimationFrame(animateParticles);
        }

        // Start animation
        animateParticles();
    } else {
        console.warn('Auth background element not found');
    }
}

// Initialize form switching
function initFormSwitching() {
    const forms = document.querySelectorAll('.auth-form');
    const switchButtons = document.querySelectorAll('.switch-form');
    
    if (forms.length === 0) {
        console.warn('Auth forms not found');
        return;
    }
    
    // Handle form switching
    switchButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetForm = button.getAttribute('data-form');
            
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.getAttribute('data-form') === targetForm) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Initialize password toggles
function initPasswordToggles() {
    const passwordToggles = document.querySelectorAll('.toggle-password');
    
    // Handle password visibility toggle
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = toggle.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('mdi-eye');
                icon.classList.add('mdi-eye-off');
            } else {
                input.type = 'password';
                icon.classList.remove('mdi-eye-off');
                icon.classList.add('mdi-eye');
            }
        });
    });
}

// Initialize form submissions
function initFormSubmissions() {
    const forms = document.querySelectorAll('.auth-form');
    
    // Handle form submissions
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            try {
                showLoading();
                
                switch (form.id) {
                    case 'login-form':
                        await handleLogin(data);
                        break;
                    case 'register-form':
                        await handleRegister(data);
                        break;
                    case 'forgot-form':
                        await handleForgotPassword(data);
                        break;
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('error', error.message || 'An error occurred');
            } finally {
                hideLoading();
            }
        });
    });
}

// Form validation
function validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
        throw new Error('Password must be at least 8 characters long');
    }
    if (!hasUpperCase || !hasLowerCase) {
        throw new Error('Password must contain both uppercase and lowercase letters');
    }
    if (!hasNumbers) {
        throw new Error('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        throw new Error('Password must contain at least one special character');
    }
}

// Handle form submissions
async function handleLogin(data) {
    try {
        // Show loading indicator
        showSpinner();
        
        console.log('Attempting login...');
        
        // Call login API
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Hide loading indicator
        hideSpinner();
        
        // Handle error response
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            showNotification(errorData.message || 'Login failed. Please check your credentials.', 'error');
            return;
        }
        
        // Parse response data
        const responseData = await response.json();
        console.log('Login successful:', responseData);
        
        // Clear any existing auth data first
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('tenant_data');
        
        // Store authentication data in localStorage
        localStorage.setItem('token', responseData.access_token);
        localStorage.setItem('refresh_token', responseData.refresh_token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        
        // Set global authentication state
        window.Auth = window.Auth || {};
        window.Auth.isAuthenticated = true;
        window.Auth.user = responseData.user;
        
        // Show success notification
        showNotification('Login successful! Redirecting to dashboard...', 'success');
        
        // Redirect to dashboard after a short delay
        console.log('Redirecting to dashboard...');
        setTimeout(() => {
            // Use location.replace to avoid adding to browser history
            window.location.replace('/dashboard');
        }, 1000);
    } catch (error) {
        // Hide loading indicator
        hideSpinner();
        
        // Log and show error
        console.error('Login error:', error);
        showNotification('An error occurred during login. Please try again.', 'error');
    }
}

async function handleRegister(data) {
    if (data.password !== data.confirm_password) {
        throw new Error('Passwords do not match');
    }

    try {
        validatePassword(data.password);

        // Transform form data to match API requirements
        const apiData = {
            email: data.email,
            username: data.name || '', // Using name field as username
            password: data.password,
            tenant_name: data.tenant || '', // Using tenant field as tenant_name
            subdomain: data.tenant ? data.tenant.toLowerCase().replace(/[^a-z0-9]/g, '') : '', // Generate subdomain from tenant name
        };

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }

        showNotification('success', 'Registration successful! Please check your email to verify your account.');
        
        // Switch to login form
        const loginFormSwitch = document.querySelector('[data-form="login"]');
        if (loginFormSwitch) {
            loginFormSwitch.click();
        }
    } catch (error) {
        console.error('Registration error:', error);
        throw new Error(error.message || 'Registration failed');
    }
}

async function handleForgotPassword(data) {
    try {
        const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to send reset email');
        }

        showNotification('success', 'Password reset instructions have been sent to your email.');
        
        // Switch to login form
        const loginFormSwitch = document.querySelector('[data-form="login"]');
        if (loginFormSwitch) {
            loginFormSwitch.click();
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        throw new Error(error.message || 'Failed to send reset email');
    }
}

// Loading state
function showLoading() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
}

// Show notification
function showNotification(message, type = 'info') {
    console.log(`Notification: ${type} - ${message}`);
    
    // Use the global notification system
    if (window.Notifications) {
        window.Notifications.show(message, type);
    } else if (window.Notification && typeof window.Notification.show === 'function') {
        window.Notification.show(message, type);
    } else {
        // Log to console as last resort
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// Show loading spinner
function showSpinner() {
    const spinner = document.querySelector('.auth-spinner');
    if (spinner) {
        spinner.style.display = 'flex';
    }
}

// Hide loading spinner
function hideSpinner() {
    const spinner = document.querySelector('.auth-spinner');
    if (spinner) {
        spinner.style.display = 'none';
    }
} 