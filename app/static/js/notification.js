/**
 * AuraFlow.Ai - Notification System
 * Displays notifications for user feedback
 */

// Create global notification manager
window.Notifications = window.Notifications || {
  // Initialize notification container
  init: function() {
    this.container = document.getElementById('notification-container');
    
    // Create container if it doesn't exist
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'notification-container';
      document.body.appendChild(this.container);
    }
    
    // Add CSS if not already present
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 400px;
        }
        
        .notification {
          padding: 15px 20px;
          border-radius: 8px;
          background: white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 300px;
          max-width: 100%;
          animation: notificationSlideIn 0.3s ease-out;
          opacity: 0;
          transform: translateX(100%);
        }
        
        .notification.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        .notification.success {
          border-left: 4px solid #28A745;
        }
        
        .notification.error {
          border-left: 4px solid #DC3545;
        }
        
        .notification.warning {
          border-left: 4px solid #FFC107;
        }
        
        .notification.info {
          border-left: 4px solid #17A2B8;
        }
        
        .notification-icon {
          font-size: 20px;
        }
        
        .notification.success .notification-icon {
          color: #28A745;
        }
        
        .notification.error .notification-icon {
          color: #DC3545;
        }
        
        .notification.warning .notification-icon {
          color: #FFC107;
        }
        
        .notification.info .notification-icon {
          color: #17A2B8;
        }
        
        .notification-content {
          flex-grow: 1;
        }
        
        .notification-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        
        .notification-message {
          font-size: 14px;
          color: #6C757D;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #6C757D;
          cursor: pointer;
          padding: 4px;
          font-size: 16px;
        }
        
        @keyframes notificationSlideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes notificationSlideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    console.log('Notification system initialized');
  },
  
  // Show a notification
  show: function(message, type = 'info', duration = 5000) {
    // Initialize if not already done
    if (!this.container) {
      this.init();
    }
    
    console.log(`[Notification - ${type}] ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon"><i class="mdi mdi-${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : type === 'warning' ? 'alert' : 'information'}-outline"></i></div>
      <div class="notification-content">${message}</div>
      <button class="notification-close">&times;</button>
    `;
    
    // Add to container
    this.container.appendChild(notification);
    
    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('visible');
    }, 10);
    
    // Setup close button
    const closeBtn = notification.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        notification.classList.remove('visible');
        notification.style.animation = 'notificationSlideOut 0.3s forwards';
        setTimeout(() => {
          if (notification.parentNode === this.container) {
            this.container.removeChild(notification);
          }
        }, 300);
      });
    }
    
    // Auto-close after duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode === this.container) {
          notification.classList.remove('visible');
          notification.style.animation = 'notificationSlideOut 0.3s forwards';
          setTimeout(() => {
            if (notification.parentNode === this.container) {
              this.container.removeChild(notification);
            }
          }, 300);
        }
      }, duration);
    }
    
    return notification;
  },
  
  // Show a success notification
  success: function(message, duration = 5000) {
    return this.show(message, 'success', duration);
  },
  
  // Show an error notification
  error: function(message, duration = 8000) {
    return this.show(message, 'error', duration);
  },
  
  // Show a warning notification
  warning: function(message, duration = 7000) {
    return this.show(message, 'warning', duration);
  },
  
  // Show an info notification
  info: function(message, duration = 5000) {
    return this.show(message, 'info', duration);
  }
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  window.Notifications.init();
  
  // Create global Notification object for backward compatibility
  window.Notification = window.Notification || {
    show: function(message, type = 'info', duration = 5000) {
      return window.Notifications.show(message, type, duration);
    }
  };
});

// Global function for showing notifications
function showNotification(message, type = 'info', duration = 5000) {
  if (window.Notifications) {
    return window.Notifications.show(message, type, duration);
  } else {
    console.warn('Notification system not initialized, falling back to console log');
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
} 