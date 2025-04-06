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
          padding: 10px 15px;
          border-radius: 4px;
          background: white;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 300px;
          max-width: 100%;
          animation: notificationSlideIn 0.3s ease;
          opacity: 0;
          transform: translateX(100%);
        }
        
        .notification.visible {
          opacity: 1;
          transform: translateX(0);
        }
        
        /* New clean design for all notification types */
        .notification.success,
        .notification.error,
        .notification.warning,
        .notification.info {
          border-left: none;
          border-radius: 4px;
        }
        
        .notification-icon {
          font-size: 18px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }
        
        .notification.success .notification-icon {
          color: #fff;
          background-color: #28A745;
        }
        
        .notification.error .notification-icon {
          color: #fff;
          background-color: #DC3545;
        }
        
        .notification.warning .notification-icon {
          color: #fff;
          background-color: #FFC107;
        }
        
        .notification.info .notification-icon {
          color: #fff;
          background-color: #17A2B8;
        }
        
        .notification-content {
          flex-grow: 1;
          font-size: 14px;
          color: #333;
          font-weight: 500;
        }
        
        .notification-close {
          background: none;
          border: none;
          color: #aaa;
          cursor: pointer;
          padding: 4px;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 5px;
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
    
    // Use proper icon for each notification type
    let icon = 'information';
    if (type === 'success') icon = 'check';
    else if (type === 'error') icon = 'close';
    else if (type === 'warning') icon = 'alert';
    
    notification.innerHTML = `
      <div class="notification-icon"><i class="mdi mdi-${icon}"></i></div>
      <div class="notification-content">${message}</div>
      <button class="notification-close"><i class="mdi mdi-close"></i></button>
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