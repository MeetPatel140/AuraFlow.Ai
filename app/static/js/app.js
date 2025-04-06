/**
 * AuraFlow.Ai - Main Application
 * Handles application initialization, routing, and UI management
 */

// Application state
const App = {
  // Current route
  currentRoute: '/',
  
  // Route definitions
  routes: {
    '/': { title: 'Dashboard', component: 'dashboard' },
    '/login': { title: 'Login', component: 'login', public: true },
    '/register': { title: 'Register', component: 'register', public: true },
    '/forgot-password': { title: 'Forgot Password', component: 'forgot-password', public: true },
    '/pos': { title: 'Point of Sale', component: 'pos' },
    '/inventory': { title: 'Inventory', component: 'inventory' },
    '/inventory/add': { title: 'Add Inventory', component: 'inventory-add' },
    '/inventory/categories': { title: 'Inventory Categories', component: 'inventory-categories' },
    '/inventory/stock': { title: 'Inventory Stock', component: 'inventory-stock' },
    '/suppliers': { title: 'Suppliers', component: 'suppliers' },
    '/reports': { title: 'Reports', component: 'reports' },
    '/settings': { title: 'Settings', component: 'settings' },
    '/profile': { title: 'Profile', component: 'profile' },
    '/offline': { title: 'Offline', component: 'offline', public: true },
    '/dashboard': { title: 'Dashboard', component: 'dashboard' }
  },
  
  // Component templates
  components: {},
  
  // Initialize the application
  async init() {
    console.log('Initializing AuraFlow.Ai application...');
    
    // Initialize auth state
    this.waitForAuth();
    
    // Initialize UI
    this.initUI();
    
    // Initialize routing
    this.initRouting();
    
    // Show app when ready
    document.getElementById('loading-container').style.display = 'none';
    
    console.log('AuraFlow.Ai initialized');
  },
  
  // Wait for authentication to initialize
  waitForAuth() {
    window.Auth = window.Auth || {};
    window.Auth.isAuthenticated = false;
    window.Auth.user = null;
    
    // Check if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (token) {
      try {
        // Get user data from localStorage
        const userData = localStorage.getItem('user') || localStorage.getItem('user_data');
        if (userData) {
          const user = JSON.parse(userData);
          window.Auth.isAuthenticated = true;
          window.Auth.user = user;
          console.log('User authenticated from localStorage:', user.email || user.username);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  },
  
  // Initialize UI
  initUI() {
    // Initialize sidebar toggle
    this.initSidebar();
    
    // Initialize indicators
    this.initIndicators();
    
    // Update user info
    this.updateUserInfo();
    
    // Update active sidebar link
    this.updateActiveSidebarLink();
  },
  
  // Initialize loading and notification indicators
  initIndicators() {
    // Initialize notification system
    if (!window.Notification) {
      window.Notification = {
        show: function(message, type = 'info', duration = 5000) {
          console.log(`[Notification - ${type}] ${message}`);
          
          const container = document.getElementById('notification-container');
          if (!container) return;
          
          const notification = document.createElement('div');
          notification.className = `notification ${type}`;
          notification.innerHTML = `
            <div class="notification-icon"><i class="mdi mdi-${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'information'}-outline"></i></div>
            <div class="notification-content">${message}</div>
            <button class="notification-close">&times;</button>
          `;
          
          container.appendChild(notification);
          
          // Show notification
          setTimeout(() => {
            notification.classList.add('visible');
          }, 10);
          
          // Setup close button
          const closeBtn = notification.querySelector('.notification-close');
          if (closeBtn) {
            closeBtn.addEventListener('click', () => {
              notification.classList.remove('visible');
              setTimeout(() => {
                container.removeChild(notification);
              }, 300);
            });
          }
          
          // Auto-close after duration
          setTimeout(() => {
            if (notification.parentNode === container) {
              notification.classList.remove('visible');
              setTimeout(() => {
                if (notification.parentNode === container) {
                  container.removeChild(notification);
                }
              }, 300);
            }
          }, duration);
        }
      };
    }
  },
  
  // Initialize sidebar
  initSidebar() {
    const sidebar = document.getElementById('sidebar');
    
    // Handle sidebar dropdown toggles
    const dropdownToggles = document.querySelectorAll('.nav-link.has-dropdown');
    
    dropdownToggles.forEach(toggle => {
      toggle.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('data-target');
        const dropdown = document.getElementById(targetId);
        
        if (dropdown) {
          dropdown.classList.toggle('active');
          this.classList.toggle('active');
        }
      });
    });
  },
  
  // Update active sidebar link based on current route
  updateActiveSidebarLink() {
    const activeLinks = document.querySelectorAll('.nav-link.active');
    activeLinks.forEach(link => {
      link.classList.remove('active');
    });
    
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        link.classList.add('active');
        
        // If in dropdown, expand dropdown
        const dropdown = link.closest('.nav-dropdown');
        if (dropdown) {
          dropdown.classList.add('active');
          const toggleLink = document.querySelector(`[data-target="${dropdown.id}"]`);
          if (toggleLink) {
            toggleLink.classList.add('active');
          }
        }
      }
    });
  },
  
  // Update user info in UI
  updateUserInfo() {
    const userNameElement = document.getElementById('topbar-user-name');
    if (!userNameElement) return;
    
    if (window.Auth && window.Auth.user) {
      const user = window.Auth.user;
      if (user.first_name) {
        userNameElement.textContent = user.first_name;
      } else if (user.username) {
        userNameElement.textContent = user.username;
      } else if (user.email) {
        userNameElement.textContent = user.email.split('@')[0];
      } else {
        userNameElement.textContent = 'User';
      }
    }
  },
  
  // Initialize routing
  initRouting() {
    console.log('Initializing routing...');
    
    // Handle initial route
    const path = window.location.pathname;
    this.handleRoute(path, false);
    
    // Handle link clicks - use server-side navigation
    document.addEventListener('click', (event) => {
      // Find closest link
      const link = event.target.closest('a');
      if (!link) return;
      
      // Skip external links, anchors, or javascript: links
      const href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('javascript:')) {
        return;
      }
      
      // Don't show loader on auth pages to prevent infinite loops
      if (window.location.pathname.includes('/login') || 
          window.location.pathname.includes('/auth') || 
          window.location.pathname === '/' ||
          link.href.includes('/login') ||
          link.href.includes('/auth')) {
        return;
      }
      
      // Show loader before navigation
      window.Loader.show('Processing...');
    });
  },
  
  // Handle route
  handleRoute(path, pushState = true) {
    console.log('Handling route:', path);
    
    // Find the matching route
    const route = this.routes[path];
    
    // Update document title if route exists
    if (route) {
      document.title = `${route.title} | AuraFlow.Ai`;
      
      // Update page title in topbar
      const pageTitle = document.getElementById('current-page-title');
      if (pageTitle) {
        pageTitle.textContent = route.title;
      }
    }
    
    // Update active sidebar link
    this.updateActiveSidebarLink();
  },
  
  // Navigate to route - now just redirects
  navigateTo(path) {
    // Simple redirect for server-side navigation
        window.location.href = path;
  },
  
  // Show loading indicator
  showLoading(show = true) {
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
      loadingContainer.style.display = show ? 'flex' : 'none';
    }
  },
  
  // Logout user
  async logout() {
    console.log('Logging out...');
    
    try {
      // Show loading
      this.showLoading(true);
      
      // Call logout API if available
      try {
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          console.warn('Logout API call failed, proceeding with client-side logout');
        }
      } catch (apiError) {
        console.warn('Error calling logout API, proceeding with client-side logout:', apiError);
      }
      
      // Clear authentication state
      window.Auth = window.Auth || {};
      window.Auth.isAuthenticated = false;
      window.Auth.user = null;
      
      // Clear localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('tenant_data');
      
      // Clear sessionStorage items
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      
      // Clear cookies related to authentication
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      console.log('Logout complete, redirecting to login page...');
      
      // Hide loading
      this.showLoading(false);
      
      // Show logout success notification
      if (window.Notification && typeof window.Notification.show === 'function') {
        window.Notification.show('Logged out successfully', 'success');
      }
      
      // Redirect to server-side logout to clear server session
      window.location.href = '/logout';
    } catch (error) {
      // Hide loading
      this.showLoading(false);
      
      console.error('Logout error:', error);
      // Still try to redirect even if there was an error
      window.location.href = '/logout';
    }
  },
  
  // Check authentication state
  checkAuthState() {
    console.log('Checking authentication state...');
    
    // Reset auth state by default
    window.Auth = window.Auth || {};
    window.Auth.isAuthenticated = false;
    window.Auth.user = null;
    
    // Check for token in localStorage
    const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
    if (!token) {
      console.log('No authentication token found');
      return false;
    }
    
    try {
      // Get user data
      const userData = localStorage.getItem('user') || localStorage.getItem('user_data');
      if (!userData) {
        console.log('No user data found');
        return false;
      }
      
      // Parse user data
      const user = JSON.parse(userData);
      if (!user) {
        console.log('Invalid user data');
        return false;
      }
      
      // Set authenticated state
      window.Auth.isAuthenticated = true;
      window.Auth.user = user;
      
      console.log('User is authenticated:', user.username || user.email);
      return true;
    } catch (error) {
      console.error('Error checking auth state:', error);
      return false;
    }
  }
};

// Global Loader Management
window.Loader = {
    show: function(message = 'Processing...') {
        const loader = document.querySelector('.global-loader');
        const loaderText = document.getElementById('loader-text');
        
        if (loader) {
            if (loaderText) {
                loaderText.textContent = message;
            }
            
            loader.style.display = 'flex';
            loader.classList.add('active');
            
            // Force reflow to ensure the loader is displayed immediately
            loader.offsetHeight;
            
            // Set body to prevent scrolling while loader is active
            document.body.style.overflow = 'hidden';
            
            console.log('Global loader shown with message:', message);
        } else {
            console.warn('Global loader element not found');
        }
    },
    
    hide: function() {
        const loader = document.querySelector('.global-loader');
        
        if (loader) {
            loader.classList.remove('active');
            loader.style.display = 'none';
            
            // Re-enable scrolling
            document.body.style.overflow = '';
            
            console.log('Global loader hidden');
        } else {
            console.warn('Global loader element not found');
        }
    },
    
    // Specialized loader messages
    showWithMessage: function(message) {
        this.show(message);
    },
    
    // Show loader for signing in
    showSigningIn: function() {
        this.show('Processing...');
    },
    
    // Show loader for loading data
    showLoadingData: function() {
        this.show('Processing...');
    },
    
    // Show loader for saving data
    showSaving: function() {
        this.show('Processing...');
    },
    
    // Show loader for processing
    showProcessing: function() {
        this.show('Processing...');
    }
};

// Add global navigation hooks to show loader on page navigation
document.addEventListener('DOMContentLoaded', function() {
    // Intercept link clicks to show loader before navigation
    document.addEventListener('click', function(e) {
        // Check if the clicked element is a link or has a link parent
        const link = e.target.closest('a');
        
        if (link && 
            link.getAttribute('href') && 
            !link.getAttribute('href').startsWith('#') && 
            !link.getAttribute('href').startsWith('javascript:') &&
            !link.getAttribute('target') &&
            !link.classList.contains('no-loader')) {
            
            // Don't show loader on auth pages to prevent infinite loops
            if (window.location.pathname.includes('/login') || 
                window.location.pathname.includes('/auth') || 
                window.location.pathname === '/' ||
                link.href.includes('/login') ||
                link.href.includes('/auth')) {
                return;
            }
            
            // Show loader before navigation
            window.Loader.show('Processing...');
        }
    });
    
    // Intercept form submissions to show loader
    document.addEventListener('submit', function(e) {
        const form = e.target;
        
        // Only intercept forms that don't have the no-loader class
        if (form && !form.classList.contains('no-loader')) {
            window.Loader.show('Processing...');
        }
    });
    
    // Handle back/forward browser navigation
    window.addEventListener('beforeunload', function(e) {
        // Don't show loader on login pages to prevent infinite loops
        if (window.location.pathname.includes('/login') || 
            window.location.pathname.includes('/auth') || 
            window.location.pathname === '/') {
            return;
        }
        
        window.Loader.show('Processing...');
    });
    
    // Hide loader when page is fully loaded
    window.addEventListener('load', function() {
        window.Loader.hide();
    });
    
    // Add data-loader-text attribute support
    const elementsWithLoaderText = document.querySelectorAll('[data-loader-text]');
    elementsWithLoaderText.forEach(element => {
        element.addEventListener('click', function() {
            const loaderText = this.getAttribute('data-loader-text');
            if (loaderText) {
                window.Loader.show(loaderText);
            } else {
                window.Loader.show('Processing...');
            }
        });
    });
    
    console.log('Global navigation hooks initialized');
});

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = App;
  App.init();
}); 