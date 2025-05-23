/**
 * AuraFlow.Ai - Authentication Module
 * Handles user authentication and authorization
 */

// Initialize Auth module
document.addEventListener('DOMContentLoaded', function() {
  console.log('Auth module initializing...');
  
  // Initialize Auth object
  window.Auth = {
    isAuthenticated: false,
    user: null,
    
    // Initialize authentication state
    init: function() {
      console.log('Initializing authentication state...');
      
      // Check if current page requires authentication
      const protectedPaths = ['/dashboard', '/inventory', '/pos', '/reports', '/settings', '/suppliers'];
      const currentPath = window.location.pathname;
      const requiresAuth = protectedPaths.some(path => currentPath.startsWith(path));
      
      // Check if token exists in localStorage
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      if (!token && requiresAuth) {
        console.log('No authentication token found, redirecting to login...');
        this.isAuthenticated = false;
        window.location.href = '/login';
        return;
      } else if (!token) {
        console.log('No authentication token found');
        this.isAuthenticated = false;
        return;
      }
      
      try {
        // Get user data
        const userData = localStorage.getItem('user') || localStorage.getItem('user_data');
        if (!userData) {
          console.log('No user data found');
          this.isAuthenticated = false;
          return;
        }
        
        // Parse user data
        const user = JSON.parse(userData);
        if (!user) {
          console.log('Invalid user data');
          this.isAuthenticated = false;
          return;
        }
        
        // Set authenticated state
        this.isAuthenticated = true;
        this.user = user;
        
        console.log('User authenticated:', user.username || user.email);
        
        // Check if on login page but already authenticated
        if (window.location.pathname === '/login' && this.isAuthenticated) {
          console.log('Already authenticated, redirecting to dashboard...');
          window.location.href = '/dashboard';
        }
      } catch (error) {
        console.error('Error initializing auth state:', error);
        this.isAuthenticated = false;
      }
    },
    
    // Check if user is authenticated
    isUserAuthenticated: function() {
      return this.isAuthenticated;
    },
    
    // Set authenticated state
    setAuthenticated: function(isAuthenticated, userData = null) {
      this.isAuthenticated = isAuthenticated;
      this.user = userData;
      
      if (isAuthenticated && userData) {
        // Store authentication data
        if (userData.access_token) {
          localStorage.setItem('token', userData.access_token);
        }
        
        if (userData.refresh_token) {
          localStorage.setItem('refresh_token', userData.refresh_token);
        }
        
        if (userData.user) {
          localStorage.setItem('user', JSON.stringify(userData.user));
        }
      } else {
        // Clear authentication data
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('tenant_data');
      }
    },
    
    // Logout user
    logout: function() {
      console.log('Logging out...');
      
      // Clear authentication state
      this.isAuthenticated = false;
      this.user = null;
      
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('tenant_data');
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Make a logout request to the server and wait for it to complete
      fetch('/logout', { 
        method: 'GET',
        credentials: 'include'
      })
      .then(() => {
        // Redirect to login page after server confirms logout
        window.location.href = '/login';
      })
      .catch(error => {
        console.error('Error during logout:', error);
        // Still redirect to login page even if there's an error
        window.location.href = '/login';
      });
    }
  };
  
  // Setup logout handlers
  document.querySelectorAll('.logout-btn, .logout-link').forEach(element => {
    element.addEventListener('click', function(e) {
      e.preventDefault();
      window.Auth.logout();
    });
  });
  
  // Initialize authentication state
  window.Auth.init();
  
  console.log('Auth module initialized');
});